#!/usr/bin/env bash
# Restarts the site under PM2 with the settings in ecosystem.config.js (#118).
#
# Next listens on 127.0.0.1:3000 only, so visitors reach it through Caddy and nowhere else.
# When the start arguments PM2 has stored differ from ecosystem.config.js (the first run after
# #118, or any later change to them), the app is started fresh: the site is checked through
# Caddy before and after, and the previous arguments come back if it stops answering. Otherwise
# it is a plain reload.
set -euo pipefail

. "$(dirname "$0")/lib.sh"

NAME=sprecher-east
CADDYFILE="${CADDYFILE:-/etc/caddy/Caddyfile}"
DEADLINE_SECONDS="${DEADLINE_SECONDS:-90}"
cd "$APP_DIR"

# The start arguments of $NAME, as PM2 stored them (stored) or as ecosystem.config.js has them.
args_of() { # stored|wanted
  if [ "$1" = stored ]; then
    pm2 jlist 2>/dev/null | node -e '
      let raw = ""
      process.stdin.on("data", (d) => (raw += d)).on("end", () => {
        let apps = []
        try { apps = JSON.parse(raw) } catch {}
        const args = apps.find((p) => p.name === process.argv[1])?.pm2_env?.args
        console.log(Array.isArray(args) ? args.join(" ") : args || "")
      })' "$NAME"
  else
    node -e '
      const app = require(process.argv[1]).apps.find((a) => a.name === process.argv[2])
      console.log(Array.isArray(app?.args) ? app.args.join(" ") : app?.args || "")
    ' "$APP_DIR/ecosystem.config.js" "$NAME"
  fi
}

reload() { pm2 reload "$NAME" --update-env >/dev/null; }

# True once the site answers through Caddy, waiting up to DEADLINE_SECONDS.
wait_until_up() {
  local started=$SECONDS
  while [ $((SECONDS - started)) -lt "$DEADLINE_SECONDS" ]; do
    if site_is_up; then return 0; fi
    sleep 2
  done
  return 1
}

stored=$(args_of stored)
wanted=$(args_of wanted)

if ! pm2 describe "$NAME" >/dev/null 2>&1; then
  pm2 start ecosystem.config.js --only "$NAME" >/dev/null
  pm2 save --force >/dev/null
  if wait_until_up; then
    report "app was not running; started it with '$wanted'"
  else
    report "WARNING: app was not running; started it with '$wanted', but the home page does not answer 200 through Caddy"
  fi
  exit 0
fi

if [ "$stored" = "$wanted" ]; then
  reload
  report "app reloaded (start arguments unchanged: $wanted)"
  exit 0
fi

# Binding to 127.0.0.1 is only safe if Caddy reaches the app through loopback, and if the app's
# own public address (used for absolute links and images) doesn't point at port 3000.
if [[ "$wanted" == *"-H 127.0.0.1"* ]]; then
  upstreams=$({ grep -hoE '^[[:space:]]*reverse_proxy[[:space:]]+[^{]*' "$CADDYFILE" 2>/dev/null || true; } |
    tr -s '[:space:]' '\n' | grep -E ':3000$' | sort -u | tr '\n' ' ')
  loopback_only=yes
  [ -n "$upstreams" ] || loopback_only=no
  for upstream in $upstreams; do
    case "${upstream#http://}" in
      localhost:3000 | 127.0.0.1:3000 | :3000) ;;
      *) loopback_only=no ;;
    esac
  done
  if [ "$loopback_only" != yes ]; then
    reload
    report "WARNING: Caddy's upstreams for port 3000 (${upstreams:-none found}) are not all loopback, so the app still listens on every interface"
    exit 0
  fi
  if [[ "$(site_url)" == *:3000 ]]; then
    reload
    report "WARNING: NEXT_PUBLIC_SERVER_URL points at port 3000, so the app still listens on every interface"
    exit 0
  fi
fi

# Check the site through Caddy before changing anything. If it already fails, a failure after
# the restart would mean nothing, so leave the arguments as they are.
if ! site_is_up; then
  reload
  report "WARNING: the home page did not answer 200 through Caddy ($(site_url), got $(site_status /)) even before the restart, so the start arguments were left as they were"
  exit 0
fi

rollback_config=$(mktemp /tmp/sprecher-east-rollback-XXXXXX.config.js)
node -e '
  const fs = require("fs")
  const [file, name, args, out] = process.argv.slice(1)
  const config = require(file)
  config.apps = config.apps.filter((a) => a.name === name).map((a) => ({ ...a, args }))
  fs.writeFileSync(out, "module.exports = " + JSON.stringify(config, null, 2) + "\n")
' "$APP_DIR/ecosystem.config.js" "$NAME" "$stored" "$rollback_config"

pm2 delete "$NAME" >/dev/null 2>&1 || true
pm2 start ecosystem.config.js --only "$NAME" >/dev/null

if wait_until_up; then
  pm2 save --force >/dev/null
  rm -f "$rollback_config"
  report "app restarted with '$wanted' (was '$stored'); the site answers through Caddy"
  exit 0
fi

report "ERROR: the site did not answer within ${DEADLINE_SECONDS}s after restarting with '$wanted'; restoring '$stored'"
pm2 delete "$NAME" >/dev/null 2>&1 || true
pm2 start "$rollback_config" --only "$NAME" >/dev/null
pm2 save --force >/dev/null
rm -f "$rollback_config"
exit 1
