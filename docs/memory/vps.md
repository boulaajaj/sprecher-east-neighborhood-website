# VPS Deployment Info — Sprecher East

## Server Details

| Key      | Value                                            |
| -------- | ------------------------------------------------ |
| IP       | 187.77.27.93                                     |
| SSH user | root                                             |
| SSH port | 22                                               |
| Hostname | srv1371281.hstgr.cloud                           |
| OS       | Ubuntu 24.04 (with Docker + Caddy pre-installed) |
| Plan     | KVM 1 — 1 CPU, 4 GB RAM, 50 GB disk              |
| Location | Boston, USA                                      |
| Provider | Hostinger hPanel                                 |

## Domain

- Real domain: **not transferred yet** (sprechereast.com — transfer pending)
- Live now: http://187.77.27.93 (HTTP 200 ✓)
- Caddy `server_name` uses `:80` (raw port) until domain is pointed here
- When domain is set: change Caddyfile from `:80 {` to `sprechereast.com {` for auto-SSL

## SSH Key

- Type: ed25519
- Private key location (local): C:\Users\ameen\.ssh\id_ed25519_sprecher
- Public key location (local): C:\Users\ameen\.ssh\id_ed25519_sprecher.pub
- Key comment: github-actions-deploy
- Status: Added to Hostinger hPanel ✓ — still needs GitHub secrets

## GitHub Secrets needed

| Secret name | Value                                                             |
| ----------- | ----------------------------------------------------------------- |
| VPS_HOST    | 187.77.27.93                                                      |
| VPS_USER    | root                                                              |
| VPS_SSH_KEY | contents of C:\Users\ameen\.ssh\id_ed25519_sprecher (private key) |
| VPS_PORT    | 22                                                                |

## App on Server

- Deploy path: /var/www/sprecher-east
- Process manager: PM2 (process name: sprecher-east)
- Node port: 3000 (internal)
- Web server: **Caddy** (pre-installed by Hostinger) — proxies port 80 → 3000
- Caddy config: /etc/caddy/Caddyfile
- PM2 saved for reboot persistence ✓

## Caddyfile (current)

```
:80 {
    reverse_proxy localhost:3000
}
```

When domain transfers, replace `:80` with `sprechereast.com` — Caddy auto-provisions SSL.

## Setup Status

- [x] SSH key added to Hostinger hPanel
- [ ] SSH key (VPS_SSH_KEY) added to GitHub secrets
- [x] Node.js 20.20.0 installed on VPS
- [x] PM2 installed on VPS
- [x] Repo cloned to /var/www/sprecher-east
- [x] npm ci + npm run build succeeded (12 routes, 0 errors)
- [x] PM2 started (sprecher-east, online) + saved for reboot
- [x] Caddy configured — site live at http://187.77.27.93
- [ ] SSL (Let's Encrypt) — update Caddyfile when domain transfers
