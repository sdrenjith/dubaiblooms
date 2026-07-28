// PM2: `npm run build` then `pm2 start ecosystem.config.cjs` from this directory.
module.exports = {
  apps: [
    {
      name: 'dubaiblooms-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        API_URL: process.env.API_URL || 'http://127.0.0.1:5000/api',
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
        NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://dubaiblooms.ae',
      },
    },
  ],
};
