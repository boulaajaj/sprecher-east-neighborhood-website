/** @type {import('pm2').ProcessDescription} */
module.exports = {
  apps: [
    {
      name: 'sprecher-east',
      script: 'node_modules/.bin/next',
      // Listen on loopback only: the internet reaches the app through Caddy, never directly (#118).
      args: 'start -H 127.0.0.1',
      cwd: '/var/www/sprecher-east',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      // Auto-restart on crash
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
      // Logs
      out_file: '/var/log/pm2/sprecher-east-out.log',
      error_file: '/var/log/pm2/sprecher-east-error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
}
