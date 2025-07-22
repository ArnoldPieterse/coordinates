module.exports = {
  apps: [
    {
      name: 'rekursing-backend',
      script: './server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      },
      watch: false,
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ]
}; 