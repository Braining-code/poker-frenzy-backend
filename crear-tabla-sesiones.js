require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function crearTablaSesiones() {
  try {
    console.log('🔄 Creando tabla sesiones...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        fecha DATE NOT NULL,
        plataforma VARCHAR(50) NOT NULL,
        tipo VARCHAR(20) CHECK (tipo IN ('cash', 'sng', 'tournament')) NOT NULL,
        buy_in DECIMAL(10,2) NOT NULL,
        cash_out DECIMAL(10,2),
        prize DECIMAL(10,2),
        duracion DECIMAL(4,2),
        modalidad VARCHAR(100),
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Tabla sesiones creada');
    
    console.log('🔄 Creando índices...');
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sesiones_user ON sesiones(user_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones(fecha DESC);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sesiones_created ON sesiones(created_at DESC);');
    
    console.log('✅ Índices creados');
    console.log('🎉 Todo listo!');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

crearTablaSesiones();
