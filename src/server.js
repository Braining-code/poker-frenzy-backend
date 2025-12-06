const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('./routes/auth');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// MIDDLEWARE - Seguridad
app.use(helmet());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "challenges.cloudflare.com"],
    frameSrc: ["challenges.cloudflare.com"],
    connectSrc: [
      "'self'",
      "api.pokerfrenzy.com",
      "https://web-production-e4083.up.railway.app"
    ]
  }
}));

// MIDDLEWARE - Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MIDDLEWARE - CORS
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3000',
    process.env.PRODUCTION_LANDING_URL,
    process.env.PRODUCTION_APP_URL,
    "https://web-production-e4083.up.railway.app"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HEALTH CHECK
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    version: '1.0.0'
  });
});

// ROUTES
app.use('/api/auth', authRoutes);

// 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ERROR HANDLER
app.use(errorHandler);

module.exports = app;

