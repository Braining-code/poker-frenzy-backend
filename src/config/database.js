const { Pool } = require('pg');
const envConfig = require('./env');

const pool = new Pool({
  connectionString: envConfig.database.connectionString,
  max: envConfig.database.max,
  idleTimeoutMillis: envConfig.database.idleTimeoutMillis,
  connectionTimeoutMillis: envConfig.database.connectionTimeoutMillis,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

module.exports = {
  query: (text, params) => {
    const start = Date.now();
    return pool.query(text, params).then(result => {
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development') {
        console.log('Executed query', { text, duration, rows: result.rowCount });
      }
      return result;
    });
  },
  getClient: () => pool.connect(),
  pool,
};
