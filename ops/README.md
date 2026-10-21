# Server operations

Scripts the deploy workflow (`.github/workflows/deploy.yml`) runs on the VPS. Nothing here is
run by hand during a normal deploy. Changes to the server still follow `AGENTS.md`: an `infra`
issue first, then a pull request.

| Script            | What it does                                                                                      | Issue |
| ----------------- | ------------------------------------------------------------------------------------------------- | ----- |
| `backup.sh`       | Archives the database, uploaded media and `.env.local`; keeps 7 daily, 5 weekly, 5 pre-deploy     | #148  |
| `backup-db.mjs`   | Copies the live SQLite database with `VACUUM INTO` and checks the copy                            | #148  |
| `install-cron.sh` | Installs the daily backup job (08:15 UTC) in `/etc/cron.d/sprecher-east-backup`                   | #148  |
| `restart-app.sh`  | Restarts the app so it listens on `127.0.0.1:3000` only; puts it back if the site stops answering | #118  |
| `lib.sh`          | Shared helpers: annotations, reading non-secret settings, checking the site through Caddy         |       |

The scripts print `::notice` and `::warning` lines, which appear as annotations on the deploy run
whether it succeeds or fails, so the result can be read without opening the logs. The deploy log
is public, so the scripts never print secrets or file contents. The site address they check comes
from `NEXT_PUBLIC_SERVER_URL` in `.env.local`, and the check goes to Caddy on the server itself.

## Backups

Archives are in `/var/backups/sprecher-east/{daily,weekly,pre-deploy,manual}/`, readable by root
only. Each one holds `payload.db`, `env.local` and the `media/` folder. Hostinger's weekly
whole-server backups (hPanel → VPS → Backups & Monitoring) include this folder, so a copy also
exists off the machine.

- Daily at 08:15 UTC, kept 7 days; Sunday's is also kept as a weekly, 5 weeks.
- Before every deploy, the 5 most recent kept.
- By hand, never deleted automatically: `sudo bash ops/backup.sh manual`. Delete old ones yourself.

A run refuses to start unless the disk has room for the copy plus 1 GB to spare, so a backup
never fills the disk the live site writes to. The daily job logs to
`/var/log/sprecher-east-backup.log`; each deploy reports the newest daily archive.

## Restore content from an archive

Run on the VPS as root. This replaces the site's current content with the archive's.

```bash
cd /var/www/sprecher-east
bash ops/backup.sh manual                 # keep a copy of what you are about to replace
mkdir -p /root/restore && tar -C /root/restore -xzf /var/backups/sprecher-east/daily/<archive>.tar.gz
pm2 stop sprecher-east
cp /root/restore/payload.db data/payload.db
rm -f data/payload.db-wal data/payload.db-shm data/payload.db-journal
# Only if media should be restored too: keep the current folder aside, then copy the archive's.
mv public/media public/media.before-restore && cp -a /root/restore/media public/media
npx payload migrate                       # brings an older archive up to the current schema
pm2 start sprecher-east
rm -rf /root/restore                      # it holds a copy of .env.local
```

Then open the site and Admin, and check the restored content. `env.local` in the archive is there
for reference if the server's `.env.local` was lost; copy values back by hand. Once the restore
looks right, delete `public/media.before-restore`.
