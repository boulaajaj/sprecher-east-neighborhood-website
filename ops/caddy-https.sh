#!/usr/bin/env bash
# HTTPS at Caddy (#235): the site's HTTPS blocks send HSTS, and plain HTTP to the server's IP
# (or to the domain, if a block serves it) redirects to the canonical HTTPS address instead of
# reaching the app.
#
# Two edits to /etc/caddy/Caddyfile, and nothing else, checked before saving:
#   - each HTTPS site block for the domain or www gets one line importing
#     /etc/caddy/sprecher-east-hsts.caddy (a copy of ops/caddy/hsts.caddy, where max-age is set)
#   - in each site block that serves plain HTTP (`:80`, `http://<IP>`, `http://<domain>`), the
#     one-line `reverse_proxy` to the app becomes `redir https://<domain>{uri} 308`
# The canonical address is NEXT_PUBLIC_SERVER_URL. Every change is validated first and the old
# Caddyfile backed up (Caddyfile.bak and a dated copy), then replaced in one rename. Success
# means the domain sends the header and plain HTTP to the domain and the IP redirects
# permanently to https; otherwise, or on any unexpected failure while changing, the previous files
# come back and the script fails. That check also runs when nothing needed changing. Its results,
# like `curl -I`, are printed as annotations on the deploy run.
set -Eeuo pipefail
umask 077
trap '' HUP # a dropped SSH session must not stop the script between a change and its rollback

. "$(dirname "$0")/lib.sh"

on_unexpected_error() {
  [ "$BASH_SUBSHELL" -eq 0 ] || return 0
  trap - ERR
  report "ERROR: caddy-https.sh failed unexpectedly at line $1; check /etc/caddy by hand"
}
trap 'on_unexpected_error $LINENO' ERR

CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
HSTS_FILE="${HSTS_FILE:-/etc/caddy/sprecher-east-hsts.caddy}"
RELOAD_CADDY="${RELOAD_CADDY:-systemctl reload caddy}"
APP_PORT="${APP_PORT:-3000}"
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
hsts_backup=""
trap 'rm -f "$candidate" "$original" "$ip_address_file"' EXIT

# Prints the Caddyfile with both edits made, and writes the address of a plain-HTTP block that
# serves the IP (or any host) to $ip_address_file. Exits 3 if the layout can't be read safely, 4
# if no block serves the domain over HTTPS, 5 if a plain-HTTP block reaches the app other than
# through one plain `reverse_proxy` line, 7 if a block mixes the HTTPS domain with other addresses.
# A site's address list may span lines (each but the last ending in a comma); it is classified
# as a whole.
rewrite() {
  awk -v host="$host" -v imp="$IMPORT_LINE" -v redir="$REDIR_LINE" -v port="$APP_PORT" \
    -v side="$ip_address_file" '
    function clean(s) { sub(/(^|[[:space:]])#.*$/, "", s); gsub(/^[[:space:]]+|[[:space:]]+$/, "", s); return s }
    function ours(t) { return t == host || t == "www." host }
    # 1: every address is the domain or www over HTTPS. 2: every address is plain HTTP, on the
    # IP or any host (":80", "http://", "http://<IPv4>[:80]", "<IPv4>:80") or on the domain or www
    # ("http://<domain>", "<domain>:80"). 3: the HTTPS domain mixed with anything else.
    function kind(addr,   n, i, t, a, dom, plain, other) {
      n = split(addr, a, /[ ,\t]+/)
      for (i = 1; i <= n; i++) {
        t = a[i]
        if (t == "") continue
        if (t ~ /^(http:\/\/)?([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)?(:80)?$/ && (t ~ /^http:\/\// || t ~ /:80$/)) {
          plain++
          if (t ~ /^(http:\/\/)?(:80)?$/ || t ~ /[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/) caught = caught " " t
          continue
        }
        if (t ~ /^http:\/\// || t ~ /:80$/) {
          sub(/^http:\/\//, "", t); sub(/:80$/, "", t)
          if (ours(t)) plain++; else other++
          continue
        }
        sub(/^https:\/\//, "", t); sub(/:443$/, "", t)
        if (ours(t)) dom++; else other++
      }
      if (dom && !plain && !other) return 1
      if (plain && !dom && !other) return 2
      if (dom) return 3
      return 0
    }
    {
      text[NR] = $0
      s = clean($0)
      if ($0 ~ /<</) bad = 3
      # An address line ending in a comma continues on the next line.
      if (depth == 0 && s ~ /,$/ && s !~ /[{}]/) { pending = pending " " s; next }
      if (depth == 0 && pending != "" && s !~ /\{$/) bad = 3
      if (depth == 0 && s ~ /\{$/ && s !~ /^\{/ && s !~ /^&?\(/) {
        caught = ""
        start = NR; k = kind(pending " " substr(s, 1, length(s) - 1)); has = 0; pending = ""
        if (k == 3) mixed = 1
        if (k == 2 && caught != "" && ipaddr == "") ipaddr = caught
      }
      if (depth > 0 && start && k == 1 && s == imp) has = 1
      if (depth > 0 && start && k == 2 && s ~ /^reverse_proxy([[:space:]]|$)/) {
        if (depth == 1 && s ~ ("^reverse_proxy[[:space:]]+(http://)?(localhost|127\\.0\\.0\\.1)?:" port "$")) swap[NR] = 1
        else odd = 1
      }
      t = s; opens = gsub(/\{/, "", t)
      t = s; closes = gsub(/\}/, "", t)
      depth += opens - closes
      if (depth < 0) bad = 3
      if (depth == 0 && start) {
        if (k == 1) { domains++; if (!has) add[start] = 1 }
        start = 0
      }
    }
    END {
      if (bad || depth != 0) exit 3
      if (mixed) exit 7
      if (!domains) exit 4
      if (odd) exit 5
      if (pending != "") exit 3
      if (ipaddr != "") { gsub(/^[[:space:]]+|[[:space:]]+$/, "", ipaddr); print ipaddr > side }
      for (i = 1; i <= NR; i++) {
        if (i in swap) {
          match(text[i], /^[[:space:]]*/)
          print substr(text[i], 1, RLENGTH) redir
          continue
        }
        print text[i]
        if (i in add) {
          indent = "\t"
          if ((i + 1) in text && match(text[i + 1], /^[[:space:]]+/)) indent = substr(text[i + 1], 1, RLENGTH)
          print indent imp
        }
      }
    }' "$CADDYFILE"
}

status=0
rewrite >"$candidate" || status=$?
case $status in
  0) ;;
  4)
    report "WARNING: no Caddy site block serves $host over HTTPS, so HSTS and the IP redirect were not added"
    exit 0
    ;;
  5)
    report "WARNING: a plain-HTTP Caddy site block reaches the app other than through one reverse_proxy line, so the Caddyfile was left alone"
    exit 0
    ;;
  7)
    report "WARNING: a Caddy site block serves $host together with other addresses, so the Caddyfile was left alone"
    exit 0
    ;;
  *)
    report "WARNING: could not read the Caddyfile's layout safely, so it was left alone"
    exit 0
    ;;
esac
ip_address=$(cat "$ip_address_file" 2>/dev/null || true)

# The new Caddyfile may differ from the old one only by the import lines, and by redirect lines
# in place of the same number of plain reverse_proxy lines. Compare against a copy that ends
# with a newline, since the rewritten file always does.
sed -e '$a\' "$CADDYFILE" >"$original"
changes=$(diff --unchanged-line-format= --old-line-format='-%L' --new-line-format='+%L' \
  "$original" "$candidate" || true)
removed=$(sed -n 's/^-[[:space:]]*//p' <<<"$changes")
added=$(sed -n 's/^+[[:space:]]*//p' <<<"$changes")
removed_count=$(grep -c . <<<"$removed" || true)
redirects=$(grep -cxF "$REDIR_LINE" <<<"$added" || true)
imports=$(grep -cxF "$IMPORT_LINE" <<<"$added" || true)
if { [ -n "$removed" ] && grep -vqE "^reverse_proxy[[:space:]]+(http://)?(localhost|127\.0\.0\.1)?:$APP_PORT$" <<<"$removed"; } ||
  [ "$((redirects + imports))" -ne "$(grep -c . <<<"$added" || true)" ] ||
  [ "$removed_count" -ne "$redirects" ]; then
  report "ERROR: the Caddyfile edit changed more than the HSTS imports and the HTTP redirects; nothing was changed"
  exit 1
fi

hsts_changed=no
if ! cmp -s "$SOURCE" "$HSTS_FILE"; then hsts_changed=yes; fi
caddyfile_changed=no
if [ "$((redirects + imports))" -gt 0 ]; then caddyfile_changed=yes; fi

# Replaces <dst> with a copy of <src> in one rename, keeping <dst>'s owner and mode, so the file
# is never seen half written.
atomic_replace() { # <src> <dst>
  local tmp
  tmp=$(mktemp "$2.sprecher-east-tmp-XXXXXX") || return 1
  if cp "$1" "$tmp" && chown --reference="$2" "$tmp" && chmod --reference="$2" "$tmp" && mv -f "$tmp" "$2"; then
    return 0
  fi
  rm -f "$tmp"
  return 1
}

restore_hsts() {
  if [ -n "$hsts_backup" ]; then
    cp -p "$hsts_backup" "$HSTS_FILE" && rm -f "$hsts_backup"
  else
    rm -f "$HSTS_FILE"
  fi
}

# Puts the previous Caddyfile and HSTS file back and reloads. On failure, prints what went wrong.
restore_all() {
  local failed=""
  if [ "$caddyfile_changed" = yes ] && [ -f "$CADDYFILE.bak-$stamp" ] &&
    ! atomic_replace "$CADDYFILE.bak-$stamp" "$CADDYFILE"; then
    failed="the Caddyfile (backup: $CADDYFILE.bak-$stamp)"
  fi
  if [ "$hsts_changed" = yes ] && ! restore_hsts; then failed="${failed:+$failed and }the HSTS file (copy: $hsts_backup)"; fi
  if [ -n "$failed" ]; then
    echo "Could not put back $failed."
    return 1
  fi
  if ! $RELOAD_CADDY >/dev/null 2>&1; then
    echo "The previous files are back, but Caddy would not reload them."
    return 1
  fi
}

# From the HSTS install until the check passes, any unexpected failure puts the old files back.
mutating=no
on_unexpected_error() {
  [ "$BASH_SUBSHELL" -eq 0 ] || return 0
  trap - ERR
  if [ "$mutating" = yes ] && detail=$(restore_all); then
    report "ERROR: caddy-https.sh failed unexpectedly at line $1; the previous Caddy config is back"
  elif [ "$mutating" = yes ]; then
    report "ERROR: caddy-https.sh failed unexpectedly at line $1. $detail"
  else
    report "ERROR: caddy-https.sh failed unexpectedly at line $1; nothing was changed"
  fi
  exit 1
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
# Plain HTTP to the IP block: to its IP when it names one, else to any host it catches.
ip_headers() {
  local ip
  ip=$(grep -oE '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' <<<"$ip_address" | head -n 1 || true)
  headers_of "http://127.0.0.1/login" -H "Host: ${ip:-127.0.0.1}"
}

# What must hold, changed or not: the site answers, the domain sends the HSTS header, and plain
# HTTP to the domain and to the IP redirects permanently to the same path on the HTTPS domain.
# Prints the first problem, or nothing.
problem_now() {
  local d h i
  wait_until_up 20 || { echo "the site does not answer through Caddy"; return; }
  d=$(domain_headers)
  [ "$(field 3 "$d")" = "$hsts_value" ] ||
    { echo "https://$host/ does not send Strict-Transport-Security: $hsts_value"; return; }
  h=$(http_headers)
  case "$(field 1 "$h")" in 301 | 308) ;; *) h="" ;; esac
  [ -n "$h" ] && [ "$(field 2 "$h")" = "https://$host/login" ] ||
    { echo "plain HTTP to $host does not redirect permanently to https://$host/login"; return; }
  if [ -n "$ip_address" ]; then
    i=$(ip_headers)
    [ "$(field 1 "$i")" = 308 ] && [ "$(field 2 "$i")" = "https://$host/login" ] ||
      { echo "plain HTTP to the IP answers $(field 1 "$i") instead of redirecting to https://$host/login"; return; }
  fi
}

if [ "$caddyfile_changed" = no ] && [ "$hsts_changed" = no ]; then
  problem=$(problem_now)
  if [ -n "$problem" ]; then
    report "ERROR: Caddy's HTTPS settings look in place, but $problem; nothing was changed"
    exit 1
  fi
  report "Caddy HTTPS settings already in place (HSTS $hsts_value, Caddy $(caddy_version))"
else
  mutating=yes
  if [ -f "$HSTS_FILE" ]; then
    hsts_backup=$(mktemp "$HSTS_FILE.previous-XXXXXX")
    cp -p "$HSTS_FILE" "$hsts_backup"
  fi
  install -m 644 "$SOURCE" "$HSTS_FILE"
  if ! caddy_accepts "$candidate"; then
    mutating=no
    if restore_hsts; then
      report "ERROR: Caddy rejected the HSTS and HTTP redirect change; nothing was changed"
    else
      report "ERROR: Caddy rejected the change, and the previous HSTS file could not be put back (copy: $hsts_backup)"
    fi
    exit 1
  fi
  if [ "$caddyfile_changed" = yes ]; then
    cp -p "$CADDYFILE" "$CADDYFILE.bak"
    cp -p "$CADDYFILE" "$CADDYFILE.bak-$stamp"
    atomic_replace "$candidate" "$CADDYFILE"
  fi

  problem=""
  if ! $RELOAD_CADDY >/dev/null 2>&1; then
    problem="Caddy would not reload with the HSTS and HTTP redirect change"
  else
    problem=$(problem_now)
  fi
  if [ -n "$problem" ]; then
    mutating=no
    if detail=$(restore_all); then
      report "ERROR: $problem; the previous Caddy config is back"
    else
      report "ERROR: $problem. $detail"
    fi
    exit 1
  fi
  mutating=no
  if [ -n "$hsts_backup" ]; then rm -f "$hsts_backup"; fi
  if [ "$caddyfile_changed" = yes ]; then
    report "Caddy HTTPS settings applied: $imports HSTS import(s), $redirects HTTP redirect(s) (backup: $CADDYFILE.bak-$stamp)"
  else
    report "Caddy HSTS updated: $hsts_value"
  fi
fi

# Evidence for #235, as `curl -I` sees it from this server through Caddy.
d=$(domain_headers)
report "curl -I https://$host/ → $(field 1 "$d"), Strict-Transport-Security: $(field 3 "$d")"
h=$(http_headers)
report "curl -I http://$host/login → $(field 1 "$h") to $(field 2 "$h")"
if [ -n "$ip_address" ]; then
  i=$(ip_headers)
  report "curl -I http://<IP>/login → $(field 1 "$i") to $(field 2 "$i")"
else
  report "WARNING: no Caddy site block serves plain HTTP on the IP, so there was nothing to redirect"
fi
