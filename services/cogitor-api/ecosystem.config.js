const logsDir = process.cwd() + '/tmp/logs';

const env = {
  // environment
  NODE_ENV: 'production',

  // author
  AUTHOR: process.env.AUTHOR || 'OOO Alanov',
  NAME: process.env.NAME || 'Backend',
  DESCRIPTION: process.env.DESCRIPTION || 'магазин',
  VERSION: process.env.VERSION || '1.0.0',

  // application
  PRIMARY_COLOR: process.env.PRIMARY_COLOR || '#87e8de',
  APP_HOST: process.env.APP_HOST || '10.160.1.111',
  BACKEND_PORT: +process.env.BACKEND_PORT || 3333,
  FRONTEND_PORT: +process.env.FRONTEND_PORT || 3000,
  END_POINT: process.env.END_POINT || 'api',
  RATE_LIMIT_MAX: +process.env.RATE_LIMIT_MAX || 10000,
  // JWT
  SECURITY_ACCESS_JWT_SECRET:
    process.env.SECURITY_ACCESS_JWT_SECRET || 'access-secret',
  SECURITY_REFRESH_JWT_SECRET:
    process.env.SECURITY_REFRESH_JWT_SECRET || 'refresh-secret',
  SECURITY_ACCESS_TOKEN_EXPIRED:
    process.env.SECURITY_ACCESS_TOKEN_EXPIRED || '12h',
  SECURITY_REFRESH_TOKEN_EXPIRED:
    process.env.SECURITY_REFRESH_TOKEN_EXPIRED || '30d',
};
module.exports = {
  apps: [
    {
      name: 'backend',
      script: 'dist/src/main.js',
      instances: 1,
      max_restarts: 5,
      autorestart: true,
      watch: false,
      error_file: `${logsDir}/backend/error.log`,
      out_file: `${logsDir}/backend/out.log`,
      log_file: null,
    },
  ],
};
