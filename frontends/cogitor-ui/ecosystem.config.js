module.exports = {
    script: "serve",
  env: {
    PM2_SERVE_PATH: './build',
    PM2_SERVE_PORT: 8080,
    PM2_SERVE_SPA: 'true',
  }
  }