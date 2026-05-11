// PM2: `npm run build` then `pm2 start ecosystem.config.cjs` (loads `.env` from this directory).
module.exports = {
  apps: [
    {
      name: 'dubaiblooms-api',
      cwd: __dirname,
      script: 'dist/app.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
