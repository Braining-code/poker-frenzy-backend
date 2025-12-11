const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// ========================================
// ROOT DEL PROYECTO (Railway OK)
// ========================================
const rootDir = path.join(__dirname, '..');

// ========================================
// SECURITY
// ========================================
app.use(helmet());

// ========================================
// BODY PARSING
// ========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================
// CORS
// ========================================
app.use(cors({
  origin: [
    "https://pokerfrenzy.club",
    "https://www.pokerfrenzy.club",
    "https://frenzy.poker",
    "https://www.frenzy.poker",
    process.env.PRODUCTION_LANDING_URL,
    process.env.PRODUCTION_APP_URL,
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========================================
// API ROUTES
// ========================================
app.use('/api/auth', authRoutes);

// ========================================
// ARCHIVOS ESTÁTICOS (antes de rutas)
// ========================================
app.use(express.static(path.join(rootDir, 'app')));

// ========================================
// HOME → Sirve dashboard directamente
// ========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'app', 'app-completa.html'));
});

// ========================================
// 404
// ========================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================
app.use(errorHandler);

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

module.exports = app;
