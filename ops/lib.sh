# Shared helpers for the ops scripts. Sourced, not run: . "$(dirname "$0")/lib.sh"
#
# The scripts run inside the deploy's SSH step. Lines they print as `::notice` or `::warning`
# become annotations on the deploy run, on success and on failure alike, so the result can be
# read without opening the logs. The deploy log is public: never print secrets or file contents.

APP_DIR="${APP_DIR:-/var/www/sprecher-east}"

# report "message" → notice; "WARNING: …" → warning; "ERROR: …" → error.
report() {
  case "$*" in
    ERROR:*) echo "::error title=Server::$*" ;;
    WARNING:*) echo "::warning title=Server::$*" ;;
    *) echo "::notice title=Server::$*" ;;
  esac
}

# The value of a setting in .env.local (last one wins; `export`, quotes and a trailing
# ` # comment` removed). Prints nothing if unset.
# Only for non-secret settings: the value must never be printed.
env_value() {
  [ -r "$APP_DIR/.env.local" ] || return 0
  sed -n -E "s/^[[:space:]]*(export[[:space:]]+)?$1[[:space:]]*=[[:space:]]*//p" "$APP_DIR/.env.local" |
    tail -n 1 | tr -d "\r" | sed -E 's/[[:space:]]+#.*$//; s/[[:space:]]*$//' | tr -d "\"'"
}

# The site's public origin, e.g. https://sprechereast.com, from SITE_URL or the app's own
# NEXT_PUBLIC_SERVER_URL. Prints nothing if neither is set.
site_url() {
  local url="${SITE_URL:-$(env_value NEXT_PUBLIC_SERVER_URL)}" scheme rest
  [ -n "$url" ] || return 0
  case "$url" in
    *://*)
      scheme="${url%%://*}"
      rest="${url#*://}"
      ;;
    *)
      scheme=https
      rest="$url"
      ;;
  esac
  rest="${rest%%/*}"
  printf '%s://%s' "$scheme" "${rest%%\?*}"
}

# The HTTP status of a request to the public site, sent to Caddy on this machine rather than
# out through DNS. Extra curl arguments (method, body) follow the path. Prints 000 when nothing
# answers or no site address is known.
site_status() { # <path> [curl args…]
  local path="$1" url hostport host port
  shift
  url=$(site_url)
  if [ -z "$url" ]; then
    echo 000
    return 0
  fi
  hostport="${url#*://}"
  host="${hostport%%:*}"
  port="${hostport##*:}"
  if [ "$port" = "$hostport" ]; then
    if [ "${url%%://*}" = http ]; then port=80; else port=443; fi
  fi
  curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
    --resolve "$host:$port:127.0.0.1" "$@" "$url$path" || true
}

# True when the public home page answers 200 through Caddy on this machine. A redirect doesn't
# count: Caddy can answer one without ever reaching the app.
site_is_up() { [ "$(site_status /)" = 200 ]; }

# True once the home page answers 200 through Caddy, waiting up to the given number of seconds
# (default 90). Use it right after a restart or reload, while the app may still be starting.
wait_until_up() {
  local deadline=$((SECONDS + ${1:-90}))
  while [ "$SECONDS" -lt "$deadline" ]; do
    if site_is_up; then return 0; fi
    sleep 2
  done
  return 1
}
