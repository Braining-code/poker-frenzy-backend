module.exports = {
  database: {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key_change_in_production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_key_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  brevo: {
    apiKey: process.env.BREVO_API_KEY,
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'noreply@pokerfrenzy.com',
    senderName: process.env.BREVO_SENDER_NAME || 'Poker Frenzy',
  },
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  urls: {
    landing: process.env.PRODUCTION_LANDING_URL || process.env.LANDING_URL || 'http://localhost:3001',
    app: process.env.PRODUCTION_APP_URL || process.env.APP_URL || 'http://localhost:3002',
  },
};
