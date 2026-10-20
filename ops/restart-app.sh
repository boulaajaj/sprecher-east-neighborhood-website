#!/usr/bin/env bash
# Restarts the site under PM2 with the settings in ecosystem.config.js (#118).
#
# Next listens on 127.0.0.1:3000 only, so visitors can reach it through Caddy and nowhere else.
# The first run moves the old process (listening on every interface) over; it checks the site
# through Caddy afterwards and puts the old process back if anything is wrong. Later runs reload.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sprecher-east}"
NAME=sprecher-east
SITE_HOST="${SITE_HOST:-sprechereast.com}"
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
cd "$APP_DIR"

report() { echo "REPORT: $*"; }

pm2_args() {
  pm2 jlist | node -e '
    let raw = ""
    process.stdin.on("data", (d) => (raw += d)).on("end", () => {
      const app = JSON.parse(raw).find((p) => p.name === process.argv[1])
      const args = app?.pm2_env?.args
      console.log(Array.isArray(args) ? args.join(" ") : args || "")
    })' "$NAME"
}

site_is_healthy() {
  curl -fsS -o /dev/null --max-time 5 http://127.0.0.1:3000/ &&
    curl -fsS -o /dev/null --max-time 10 --resolve "$SITE_HOST:443:127.0.0.1" "https://$SITE_HOST/"
}

if [[ "$(pm2_args)" == *"-H 127.0.0.1"* ]]; then
  pm2 reload "$NAME" --update-env >/dev/null
  report "app reloaded; it listens on 127.0.0.1:3000 only"
  exit 0
fi

# Binding to 127.0.0.1 is only safe if Caddy reaches the app through loopback.
upstreams=$({ grep -hoE '^[[:space:]]*reverse_proxy[[:space:]]+[^[:space:]{]+' "$CADDYFILE" || true; } |
  awk '{ print $2 }' | sort -u | tr '\n' ' ')
report "Caddy upstreams: ${upstreams:-none found}"
loopback_only=yes
[ -n "$upstreams" ] || loopback_only=no
for upstream in $upstreams; do
  case "${upstream#http://}" in
    localhost:3000 | 127.0.0.1:3000 | "[::1]:3000" | :3000) ;;
    *) loopback_only=no ;;
  esac
done
if [ "$loopback_only" != yes ]; then
  pm2 reload "$NAME" --update-env >/dev/null
  report "WARNING: Caddy does not proxy to localhost:3000 only, so port 3000 was left as it was"
  exit 0
fi

rollback_config=$(mktemp /tmp/sprecher-east-rollback-XXXXXX.config.js)
sed 's/start -H 127\.0\.0\.1/start/' ecosystem.config.js >"$rollback_config"

pm2 delete "$NAME" >/dev/null
pm2 start ecosystem.config.js --only "$NAME" >/dev/null

for _ in $(seq 1 30); do
  if site_is_healthy; then
    pm2 save --force >/dev/null
    rm -f "$rollback_config"
    report "app restarted on 127.0.0.1:3000 only; the site answers through Caddy"
    exit 0
  fi
  sleep 2
done

report "ERROR: the site did not answer after binding to 127.0.0.1; restoring the previous setup"
pm2 delete "$NAME" >/dev/null || true
pm2 start "$rollback_config" --only "$NAME" >/dev/null
pm2 save --force >/dev/null
rm -f "$rollback_config"
exit 1
