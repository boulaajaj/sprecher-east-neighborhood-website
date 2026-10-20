#!/usr/bin/env bash
# Backs up the site's data: database, uploaded media and server settings (#148).
#
# Usage: bash ops/backup.sh [daily|pre-deploy]
#   daily       run by cron (/etc/cron.d/sprecher-east-backup); on Sundays a copy is also kept as weekly
#   pre-deploy  run by the deploy workflow before database migrations
#
# Archives go to $BACKUP_ROOT/<kind>/sprecher-east-<UTC time>.tar.gz, readable by root only.
# Restore steps: ops/README.md.
set -euo pipefail

KIND="${1:-daily}"
APP_DIR="${APP_DIR:-/var/www/sprecher-east}"
BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/sprecher-east}"
MIN_FREE_KB=$((1024 * 1024)) # refuse to run with less than 1 GB free

case "$KIND" in
  daily | pre-deploy) ;;
  *)
    echo "usage: $0 [daily|pre-deploy]" >&2
    exit 2
    ;;
esac

umask 077
mkdir -p "$BACKUP_ROOT"/{daily,weekly,pre-deploy}
chmod 700 "$BACKUP_ROOT"

free_kb=$(df -Pk "$BACKUP_ROOT" | awk 'NR == 2 { print $4 }')
if [ "$free_kb" -lt "$MIN_FREE_KB" ]; then
  echo "[backup] ERROR: only $((free_kb / 1024)) MB free on the backup disk; not backing up" >&2
  exit 1
fi

stamp=$(date -u +%Y-%m-%dT%H%MZ)
work=$(mktemp -d "$BACKUP_ROOT/.work-XXXXXX")
trap 'rm -rf "$work"' EXIT

node "$APP_DIR/ops/backup-db.mjs" "$APP_DIR/data/payload.db" "$work/payload.db"
if [ -d "$APP_DIR/public/media" ]; then
  tar -C "$APP_DIR/public" -cf "$work/media.tar" media
fi
if [ -f "$APP_DIR/.env.local" ]; then
  cp "$APP_DIR/.env.local" "$work/env.local"
fi

archive="$BACKUP_ROOT/$KIND/sprecher-east-$stamp.tar.gz"
tar -C "$work" -czf "$archive.partial" .
mv "$archive.partial" "$archive"

# On Sundays, keep the daily archive as a weekly one too (hard link: no extra space).
if [ "$KIND" = daily ] && [ "$(date -u +%u)" = 7 ]; then
  ln -f "$archive" "$BACKUP_ROOT/weekly/$(basename "$archive")"
fi

# Retention: 7 daily, 5 weekly, 5 most recent pre-deploy.
prune() { # <dir> <keep>
  find "$1" -maxdepth 1 -name 'sprecher-east-*.tar.gz' -printf '%f\n' | sort -r |
    tail -n +"$(($2 + 1))" | while read -r old; do rm -f "$1/$old"; done
}
prune "$BACKUP_ROOT/daily" 7
prune "$BACKUP_ROOT/weekly" 5
prune "$BACKUP_ROOT/pre-deploy" 5

size=$(du -h "$archive" | cut -f1)
echo "REPORT: backup ok: $KIND archive $(basename "$archive") ($size), $((free_kb / 1024 / 1024)) GB free"
