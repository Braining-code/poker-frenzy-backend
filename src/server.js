const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth.js');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ======================
// SECURITY
// ======================
app.use(helmet());

// ======================
// BODY PARSING
// ======================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ======================
// CORS
// ======================
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    process.env.PRODUCTION_LANDING_URL,
    process.env.PRODUCTION_APP_URL,
    "https://pokerfrenzy.club",
    "https://web-production-e4083.up.railway.app"
  ],
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ======================
// HEALTH CHECK
// ======================
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '1.0.0' });
});

// ======================
// API ROUTES
// ======================
app.use('/api/auth', authRoutes);

// ======================
// STATIC FILES (Dashboard web app)
// ======================
app.use(express.static(path.join(__dirname, 'app')));

// ======================
// HOME = Dashboard
// ======================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'app-completa.html'));
});

// ======================
// 404
// ======================
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ======================
// ERROR HANDLER
// ======================
app.use(errorHandler);

module.exports = app;

