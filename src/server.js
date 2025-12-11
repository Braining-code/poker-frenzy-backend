// ==========================================
// IMPORTS
// ==========================================
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==========================================
// ROOT DEL PROYECTO
// ==========================================
const rootDir = path.join(__dirname, '..');

// ==========================================
// SECURITY — CSP ESTABLE
// ==========================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://cdn.tailwindcss.com",
          "https://cdnjs.cloudflare.com"
        ],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "*"],
        fontSrc: ["'self'", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    }
  })
);

// ==========================================
// NO-CACHE
// ==========================================
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// ==========================================
// BODY PARSING
// ==========================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// CORS
// ==========================================
app.use(
  cors({
    origin: [
      "https://pokerfrenzy.club",
      "https://www.pokerfrenzy.club",
      "https://frenzy.poker",
      "https://www.frenzy.poker",
      "https://app.frenzy.poker",
      process.env.PRODUCTION_LANDING_URL,
      process.env.PRODUCTION_APP_URL,
      "http://localhost:3000",
      "http://localhost:3001"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// ==========================================
// API ROUTES
// ==========================================
app.use('/api/auth', authRoutes);

// ==========================================
// ARCHIVOS FRONTEND
// ==========================================
app.use(
  express.static(path.join(rootDir, 'app'), {
    etag: false,
    lastModified: false,
    cacheControl: false
  })
);

// ==========================================
// HOME
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'app', 'dashboard-v2.html'));
});

// ==========================================
// RUTA EXPLÍCITA
// ==========================================
app.get('/dashboard-v2.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'app', 'dashboard-v2.html'));
});

// ==========================================
// NO interceptar /api/*
// ==========================================
app.get('/api/*', (req, res, next) => next());

// ==========================================
// 404
// ==========================================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ==========================================
// ERROR HANDLER
// ==========================================
app.use(errorHandler);

// ==========================================
// START SERVER
// ==========================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

module.exports = app;
