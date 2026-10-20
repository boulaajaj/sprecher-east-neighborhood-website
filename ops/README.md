# Server operations

Scripts the deploy workflow (`.github/workflows/deploy.yml`) runs on the VPS. Nothing here is
run by hand during a normal deploy. Changes to the server still follow `AGENTS.md`: an `infra`
issue first, then a pull request.

| Script            | What it does                                                                                    | Issue |
| ----------------- | ----------------------------------------------------------------------------------------------- | ----- |
| `backup.sh`       | Archives the database, uploaded media and `.env.local`; keeps 7 daily, 5 weekly, 5 pre-deploy   | #148  |
| `backup-db.mjs`   | Copies the live SQLite database with `VACUUM INTO` and checks the copy                          | #148  |
| `install-cron.sh` | Installs the daily backup job (08:15 UTC) in `/etc/cron.d/sprecher-east-backup`                 | #148  |
| `restart-app.sh`  | Restarts the app so it listens on `127.0.0.1:3000` only; rolls back if the site stops answering | #118  |

Lines a script prints as `REPORT: …` appear as notices on the deploy run, so the result can be
read without opening the logs.

## Backups

Archives are in `/var/backups/sprecher-east/{daily,weekly,pre-deploy}/`, readable by root only.
Each one holds `payload.db`, `media.tar` and `env.local`. Hostinger's weekly whole-server
backups (hPanel → VPS → Backups & Monitoring) include this folder, so a copy also exists off
the machine.

Make an extra archive by hand before anything risky: `sudo bash ops/backup.sh pre-deploy`.

## Restore content from an archive

Run on the VPS as root. This replaces the site's current content with the archive's.

```bash
cd /var/www/sprecher-east
bash ops/backup.sh pre-deploy             # keep a copy of what you are about to replace
mkdir -p /root/restore && tar -C /root/restore -xzf /var/backups/sprecher-east/daily/<archive>.tar.gz
pm2 stop sprecher-east
cp /root/restore/payload.db data/payload.db
rm -f data/payload.db-wal data/payload.db-shm
tar -C public -xf /root/restore/media.tar  # only if media should be restored too
pm2 start sprecher-east
```

Then open the site and Admin, and check the restored content. `env.local` is there for reference
if the server's `.env.local` was lost; copy values back by hand.
