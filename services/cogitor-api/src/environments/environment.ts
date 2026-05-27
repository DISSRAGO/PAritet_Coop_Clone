export default (): any => ({
  // environment
  NODE_ENV: process.env.NODE_ENV,

  // author
  AUTHOR: process.env.AUTHOR || 'OOO Alanov',
  NAME: process.env.NAME || 'Backend',
  DESCRIPTION: process.env.DESCRIPTION || 'магазин',
  VERSION: process.env.VERSION || '1.0.0',

  // application
  APP_HOST: process.env.APP_HOST || 'localhost',
  BACKEND_PORT: +process.env.BACKEND_PORT || 3333,
  END_POINT: process.env.END_POINT || 'services',
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
});
