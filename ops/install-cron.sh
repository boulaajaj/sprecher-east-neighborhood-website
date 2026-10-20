#!/usr/bin/env bash
# Installs (or refreshes) the daily data backup job (#148). Run by every deploy, so the job on
# the server always matches this file.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sprecher-east}"
CRON_FILE=/etc/cron.d/sprecher-east-backup

# Cron starts with a minimal PATH; give it the directory of the node the deploy uses.
node_dir=$(dirname "$(command -v node)")

tmp=$(mktemp)
cat >"$tmp" <<EOF
# Daily data backup for the Sprecher East site (#148).
# Managed by ops/install-cron.sh in the website repo; changes here are overwritten on deploy.
SHELL=/bin/bash
PATH=$node_dir:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
15 8 * * * root bash $APP_DIR/ops/backup.sh daily >> /var/log/sprecher-east-backup.log 2>&1
EOF
install -m 644 "$tmp" "$CRON_FILE"
rm -f "$tmp"
echo "REPORT: daily backup job installed (08:15 UTC)"
