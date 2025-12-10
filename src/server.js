const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth.js');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ========================================
// PATH BASE DEL PROYECTO (🔥 IMPORTANTE)
// ========================================
const rootDir = path.join(__dirname, '..'); 
// Si __dirname = /app/src → rootDir = /app

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
    "https://frenzy.poker",
    "https://www.frenzy.poker",
    process.env.PRODUCTION_LANDING_URL,
    process.env.PRODUCTION_APP_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ========================================
// HEALTH CHECK
// ========================================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ========================================
// API ROUTES
// ========================================
app.use('/api/auth', authRoutes);

// ========================================
// STATIC FILES — SERVIR /app
// ========================================
app.use(express.static(path.join(rootDir, 'app')));

// ========================================
// HOME — servir app-completa.html
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
// ERROR HANDLER
// ========================================
app.use(errorHandler);

// ========================================
// START SERVER
// ========================================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
