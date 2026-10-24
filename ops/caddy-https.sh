#!/usr/bin/env bash
# HTTPS at Caddy (#235): the domain's HTTPS block sends HSTS, and plain HTTP to the server's IP
# (or to the domain, if a block serves it) redirects to the canonical HTTPS address instead of
# reaching the app.
#
# It only adds lines to /etc/caddy/Caddyfile, and refuses any other change:
#   - the HTTPS site block for the domain gets `import /etc/caddy/sprecher-east-hsts.caddy` (a copy
#     of ops/caddy/hsts.caddy, where max-age is set); www only redirects, so it needs none
#   - each site block that serves plain HTTP (`:80`, `http://<IP>`, `[::]:80`, `http://<domain>`)
#     gets `redir https://<domain>{uri} 308` as its first line. Caddy runs `redir` before
#     `reverse_proxy` in its default directive order, so the request never reaches the app. A
#     global `order` option could change that, so a Caddyfile with one is left alone.
# The canonical address is NEXT_PUBLIC_SERVER_URL. The new Caddyfile is validated, the old one
# backed up (written under a temporary name, compared, then renamed), and then replaced in one
# rename. Success means the domain sends the header and plain HTTP to the domain and the IP
# redirects permanently to https. Otherwise, or on any unexpected failure while changing, what
# was replaced comes back and the script fails. The check also runs when nothing needed changing,
# and when the layout wasn't recognised: then the IP still reaching the app fails the deploy.
# Results, like `curl -I`, are printed as annotations on the deploy run.
set -Eeuo pipefail
umask 077
trap '' HUP # a dropped SSH session must not stop the script between a change and its rollback

. "$(dirname "$0")/lib.sh"

on_unexpected_error() {
  [ "$BASH_SUBSHELL" -eq 0 ] || return 0
  trap - ERR
  report "ERROR: caddy-https.sh failed unexpectedly at line $1; nothing was changed"
  exit 1
}
trap 'on_unexpected_error $LINENO' ERR

CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
HSTS_FILE="${HSTS_FILE:-/etc/caddy/sprecher-east-hsts.caddy}"
RELOAD_CADDY="${RELOAD_CADDY:-systemctl reload caddy}"
SOURCE="$CODE_DIR/ops/caddy/hsts.caddy"
IMPORT_LINE="import $HSTS_FILE"

url=$(site_url)
host="${url#https://}"
if [ "$url" = "$host" ] || ! [[ "$host" =~ ^[A-Za-z0-9.-]+$ ]]; then
  report "WARNING: NEXT_PUBLIC_SERVER_URL is not a plain https:// address, so HSTS and the IP redirect were not touched"
  exit 0
fi
REDIR_LINE="redir https://$host{uri} 308"
hsts_value=$(sed -n 's/^[[:space:]]*header[[:space:]]\{1,\}Strict-Transport-Security[[:space:]]\{1,\}"\(.*\)"[[:space:]]*$/\1/p' "$SOURCE")
if [ -z "$hsts_value" ]; then
  report "ERROR: ops/caddy/hsts.caddy has no Strict-Transport-Security line; nothing was changed"
  exit 1
fi

if ! command -v caddy >/dev/null || [ ! -f "$CADDYFILE" ]; then
  report "WARNING: Caddy or $CADDYFILE not found, so HSTS and the IP redirect were not added"
  exit 0
fi
if ! caddy_accepts "$CADDYFILE"; then
  report "WARNING: the current Caddyfile does not validate in the deploy shell, so it was left alone"
  exit 0
fi
if ! wait_until_up 90; then
  report "WARNING: the home page did not answer 200 through Caddy ($url, got $(site_status /)), so HSTS and the IP redirect were not touched"
  exit 0
fi

stamp=$(date -u +%Y%m%dT%H%M%SZ)
candidate="$CADDYFILE.sprecher-east-https-new"
original="$CADDYFILE.sprecher-east-https-orig"
ip_address_file="$CADDYFILE.sprecher-east-https-ip"
trap 'rm -f "$candidate" "$original" "$ip_address_file"' EXIT

# Prints the Caddyfile with the lines added, and writes the address of a plain-HTTP block that
# serves the IP (or any host) to $ip_address_file. Exits 3 if the layout can't be read safely
# (heredocs, a site block on one line, unbalanced braces), 4 if no block serves the domain over
# HTTPS, 7 if a block mixes the HTTPS domain with other addresses, 8 if the global options set
# `order`. A site's address list may span lines (each but the last ending in a comma); it is
# classified as a whole.
rewrite() {
  awk -v host="$host" -v imp="$IMPORT_LINE" -v redir="$REDIR_LINE" -v side="$ip_address_file" '
    function clean(s) { sub(/(^|[[:space:]])#.*$/, "", s); gsub(/^[[:space:]]+|[[:space:]]+$/, "", s); return s }
    function ours(t) { return t == host || t == "www." host }
    # 1: HTTPS, every address is the domain or www, the domain among them. 4: HTTPS, www only.
    # 2: every address is plain HTTP: on the IP or any host (":80", "http://", "http://<IPv4>",
    # "<IPv4>:80", "[<IPv6>]:80", "http://[<IPv6>]") or on the domain or www ("http://<domain>",
    # "<domain>:80"). 3: the HTTPS domain mixed with anything else. 0: none of ours.
    function kind(addr,   n, i, t, a, apex, www, plain, other) {
      n = split(addr, a, /[ ,\t]+/)
      for (i = 1; i <= n; i++) {
        t = a[i]
        if (t == "") continue
        if ((t ~ /^(http:\/\/)?([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+|\[[0-9A-Fa-f:]*\])?(:80)?$/) && (t ~ /^http:\/\// || t ~ /:80$/)) {
          plain++; caught = caught " " t
          continue
        }
        if (t ~ /^http:\/\// || t ~ /:80$/) {
          sub(/^http:\/\//, "", t); sub(/:80$/, "", t)
          if (ours(t)) plain++; else other++
          continue
        }
        sub(/^https:\/\//, "", t); sub(/:443$/, "", t)
        if (t == host) apex++; else if (t == "www." host) www++; else other++
      }
      if (apex && !plain && !other) return 1
      if (www && !plain && !other) return 4
      if (plain && !apex && !www && !other) return 2
      if (apex || www) return 3
      return 0
    }
    {
      text[NR] = $0
      s = clean($0)
      if ($0 ~ /<</) bad = 3
      if (s ~ /^order([[:space:]]|$)/) order = 1
      # An address line ending in a comma continues on the next line.
      if (depth == 0 && s ~ /,$/ && s !~ /[{}]/) { pending = pending " " s; next }
      if (depth == 0 && pending != "" && s !~ /\{$/) bad = 3
      # A site block opened and closed on one line is not read: refuse rather than guess.
      if (depth == 0 && s ~ /\{.*\}/ && s !~ /^&?\(/) bad = 3
      if (depth == 0 && s ~ /\{$/ && s !~ /^\{/ && s !~ /^&?\(/) {
        caught = ""
        start = NR; k = kind(pending " " substr(s, 1, length(s) - 1)); has = 0; pending = ""
        if (k == 3) mixed = 1
        if (k == 2 && caught != "" && ipaddr == "") ipaddr = caught
      }
      if (depth == 1 && start && ((k == 1 && s == imp) || (k == 2 && s == redir))) has = 1
      t = s; opens = gsub(/\{/, "", t)
      t = s; closes = gsub(/\}/, "", t)
      depth += opens - closes
      if (depth < 0) bad = 3
      if (depth == 0 && start) {
        if (k == 1) domains++
        if ((k == 1 || k == 2) && !has) add[start] = (k == 1 ? imp : redir)
        start = 0
      }
    }
    END {
      if (bad || depth != 0 || pending != "") exit 3
      if (order) exit 8
      if (mixed) exit 7
      if (!domains) exit 4
      if (ipaddr != "") { gsub(/^[[:space:]]+|[[:space:]]+$/, "", ipaddr); print ipaddr > side }
      for (i = 1; i <= NR; i++) {
        print text[i]
        if (i in add) {
          indent = "\t"
          if ((i + 1) in text && match(text[i + 1], /^[[:space:]]+/)) indent = substr(text[i + 1], 1, RLENGTH)
          print indent add[i]
        }
      }
    }' "$CADDYFILE"
}

# Status, Location and Strict-Transport-Security of a request through Caddy on this machine.
headers_of() { # <url> [curl args…]
  local target="$1"
  shift
  { curl -s -o /dev/null -D - --max-time 15 "$@" "$target" 2>/dev/null || true; } | tr -d '\r' | awk '
    NR == 1 { code = $2 }
    tolower($1) == "location:" { loc = $2 }
    tolower($1) == "strict-transport-security:" { sub(/^[^:]*:[[:space:]]*/, ""); hsts = $0 }
    END { printf "%s|%s|%s\n", code ? code : "000", loc, hsts }'
}
field() { cut -d'|' -f"$1" <<<"$2"; }
domain_headers() { headers_of "https://$host/" --resolve "$host:443:127.0.0.1"; }
http_headers() { headers_of "http://$host/login" --resolve "$host:80:127.0.0.1"; }

ip_address=""
# The IP a visitor would type: the one the plain-HTTP block names, else this server's first
# public IPv4 (SERVER_IP overrides), else 127.0.0.1, which a `:80` catch-all answers.
probe_ip() {
  local ip
  ip=$(grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' <<<"$ip_address" | head -n 1 || true)
  [ -n "$ip" ] || ip="${SERVER_IP:-}"
  if [ -z "$ip" ]; then
    ip=$({ hostname -I 2>/dev/null || true; } | tr ' ' '\n' |
      grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' |
      grep -vE '^(127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.|169\.254\.)' | head -n 1 || true)
  fi
  echo "${ip:-127.0.0.1}"
}
ip_headers() { headers_of "http://127.0.0.1/login" -H "Host: $(probe_ip)"; }

# Prints why plain HTTP to the IP is not safe, or nothing: it must redirect permanently to the
# same path on the HTTPS domain, or not answer at all.
ip_problem() {
  local i
  i=$(ip_headers)
  case "$(field 1 "$i")" in
    000) return 0 ;;
    308) [ "$(field 2 "$i")" = "https://$host/login" ] && return 0 ;;
  esac
  echo "plain HTTP to the IP answers $(field 1 "$i") instead of redirecting to https://$host/login"
}

# What must hold, changed or not: the site answers, the domain sends the HSTS header, and plain
# HTTP to the domain and to the IP redirects permanently to the same path on the HTTPS domain.
# Prints the first problem, or nothing.
problem_now() {
  local d h
  wait_until_up 20 || { echo "the site does not answer through Caddy"; return; }
  d=$(domain_headers)
  [ "$(field 3 "$d")" = "$hsts_value" ] ||
    { echo "https://$host/ does not send Strict-Transport-Security: $hsts_value"; return; }
  h=$(http_headers)
  case "$(field 1 "$h")" in 301 | 308) ;; *) h="" ;; esac
  [ -n "$h" ] && [ "$(field 2 "$h")" = "https://$host/login" ] ||
    { echo "plain HTTP to $host does not redirect permanently to https://$host/login"; return; }
  ip_problem
}

status=0
rewrite >"$candidate" || status=$?
if [ "$status" -ne 0 ]; then
  case $status in
    4) why="no Caddy site block serves $host over HTTPS" ;;
    7) why="a Caddy site block serves $host together with other addresses" ;;
    8) why="the Caddyfile sets a global 'order', which can run reverse_proxy before redir" ;;
    *) why="the Caddyfile's layout wasn't recognised (a heredoc, a site block on one line, or unbalanced braces)" ;;
  esac
  # Left alone, but the IP must still not reach the app.
  problem=$(ip_problem)
  if [ -n "$problem" ]; then
    report "ERROR: $why, so it was left alone, and $problem; add the redirect by hand (ops/README.md, Caddy HTTPS)"
    exit 1
  fi
  report "WARNING: $why, so the Caddyfile was left alone (plain HTTP to the IP does not reach the app)"
  exit 0
fi
ip_address=$(cat "$ip_address_file" 2>/dev/null || true)

# The new Caddyfile may differ from the old one only by added import and redirect lines.
# Compare against a copy that ends with a newline, since the rewritten file always does.
sed -e '$a\' "$CADDYFILE" >"$original"
changes=$(diff --unchanged-line-format= --old-line-format='-%L' --new-line-format='+%L' \
  "$original" "$candidate" || true)
removed=$(sed -n 's/^-//p' <<<"$changes")
added=$(sed -n 's/^+[[:space:]]*//p' <<<"$changes")
added_count=$(grep -c . <<<"$added" || true)
redirects=$(grep -cxF "$REDIR_LINE" <<<"$added" || true)
imports=$(grep -cxF "$IMPORT_LINE" <<<"$added" || true)
if [ -n "$removed" ] || [ "$((redirects + imports))" -ne "$added_count" ]; then
  report "ERROR: the Caddyfile edit changed more than adding the HSTS import and the HTTP redirects; nothing was changed"
  exit 1
fi

hsts_changed=no
if ! cmp -s "$SOURCE" "$HSTS_FILE"; then hsts_changed=yes; fi
caddyfile_changed=no
if [ "$added_count" -gt 0 ]; then caddyfile_changed=yes; fi

# Copies <src> to <dst> under a temporary name in <dst>'s folder, checks the copy is identical,
# then renames it into place, so <dst> is never half written and a partial copy never counts.
# With a third argument, <dst> takes that file's owner and mode.
safe_copy() { # <src> <dst> [reference]
  local tmp
  tmp=$(mktemp "$2.sprecher-east-tmp-XXXXXX") || return 1
  if cp "$1" "$tmp" && cmp -s "$1" "$tmp" &&
    { [ -z "${3:-}" ] || { chown --reference="$3" "$tmp" && chmod --reference="$3" "$tmp"; }; } &&
    mv -f "$tmp" "$2"; then
    return 0
  fi
  rm -f "$tmp"
  return 1
}

# What the script has done so far, so a rollback puts back exactly that and nothing else.
backup=""            # the verified dated backup of the Caddyfile
replaced=no          # yes once the Caddyfile has been replaced
hsts_previous=""     # a verified copy of the HSTS file as it was, if there was one
hsts_installed=no    # yes once the HSTS file has been replaced or created

# Puts back what was replaced and reloads. On failure, prints what went wrong.
restore_all() {
  local failed=""
  if [ "$replaced" = yes ] && ! safe_copy "$backup" "$CADDYFILE" "$CADDYFILE"; then
    failed="the Caddyfile (backup: $backup)"
  fi
  if [ "$hsts_installed" = yes ]; then
    if [ -n "$hsts_previous" ]; then
      if safe_copy "$hsts_previous" "$HSTS_FILE" "$HSTS_FILE"; then
        rm -f "$hsts_previous"
      else
        failed="${failed:+$failed and }the HSTS file (copy: $hsts_previous)"
      fi
    else
      rm -f "$HSTS_FILE" || failed="${failed:+$failed and }the HSTS file"
    fi
  fi
  if [ -n "$failed" ]; then
    echo "Could not put back $failed."
    return 1
  fi
  if ! $RELOAD_CADDY >/dev/null 2>&1; then
    echo "The previous files are back, but Caddy would not reload them."
    return 1
  fi
}

# From the first change until the check passes, any unexpected failure puts back what changed.
on_unexpected_error() {
  [ "$BASH_SUBSHELL" -eq 0 ] || return 0
  trap - ERR
  local detail
  if [ "$replaced" = no ] && [ "$hsts_installed" = no ]; then
    report "ERROR: caddy-https.sh failed unexpectedly at line $1; nothing was changed"
  elif detail=$(restore_all); then
    report "ERROR: caddy-https.sh failed unexpectedly at line $1; the previous Caddy config is back"
  else
    report "ERROR: caddy-https.sh failed unexpectedly at line $1. $detail"
  fi
  exit 1
}

if [ "$caddyfile_changed" = no ] && [ "$hsts_changed" = no ]; then
  problem=$(problem_now)
  if [ -n "$problem" ]; then
    report "ERROR: Caddy's HTTPS settings look in place, but $problem; nothing was changed"
    exit 1
  fi
  report "Caddy HTTPS settings already in place (HSTS $hsts_value, Caddy $(caddy_version))"
else
  # Backups first, each verified before anything is changed.
  if [ "$caddyfile_changed" = yes ]; then
    backup="$CADDYFILE.bak-$stamp"
    safe_copy "$CADDYFILE" "$backup" "$CADDYFILE"
    safe_copy "$CADDYFILE" "$CADDYFILE.bak" "$CADDYFILE"
  fi
  if [ "$hsts_changed" = yes ] && [ -f "$HSTS_FILE" ]; then
    hsts_previous="$HSTS_FILE.previous-$stamp"
    safe_copy "$HSTS_FILE" "$hsts_previous" "$HSTS_FILE"
  fi

  if [ "$hsts_changed" = yes ]; then
    hsts_installed=yes # set first: a half-done install still gets undone
    safe_copy "$SOURCE" "$HSTS_FILE"
    chmod 644 "$HSTS_FILE"
  fi
  if ! caddy_accepts "$candidate"; then
    if detail=$(restore_all); then
      report "ERROR: Caddy rejected the HSTS and HTTP redirect change; nothing was changed"
    else
      report "ERROR: Caddy rejected the change. $detail"
    fi
    exit 1
  fi
  if [ "$caddyfile_changed" = yes ]; then
    safe_copy "$candidate" "$CADDYFILE" "$CADDYFILE"
    replaced=yes
  fi

  problem=""
  if ! $RELOAD_CADDY >/dev/null 2>&1; then
    problem="Caddy would not reload with the HSTS and HTTP redirect change"
  else
    problem=$(problem_now)
  fi
  if [ -n "$problem" ]; then
    if detail=$(restore_all); then
      report "ERROR: $problem; the previous Caddy config is back"
    else
      report "ERROR: $problem. $detail"
    fi
    exit 1
  fi
  trap - ERR
  [ -z "$hsts_previous" ] || rm -f "$hsts_previous"
  if [ "$caddyfile_changed" = yes ]; then
    report "Caddy HTTPS settings applied: $imports HSTS import(s), $redirects HTTP redirect(s) (backup: $backup)"
  else
    report "Caddy HSTS updated: $hsts_value"
  fi
fi

# Evidence for #235, as `curl -I` sees it from this server through Caddy.
d=$(domain_headers)
report "curl -I https://$host/ → $(field 1 "$d"), Strict-Transport-Security: $(field 3 "$d")"
h=$(http_headers)
report "curl -I http://$host/login → $(field 1 "$h") to $(field 2 "$h")"
i=$(ip_headers)
report "curl -I http://<IP>/login → $(field 1 "$i") to $(field 2 "$i")"
if [ -z "$ip_address" ]; then
  report "WARNING: no plain-HTTP Caddy site block for the IP was recognised; plain HTTP to the IP was checked directly and does not reach the app"
fi
