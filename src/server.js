const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const authRoutes = require('./routes/auth');
const sesionesRoutes = require('./routes/sesiones');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const rootDir = path.join(__dirname, '..');

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

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

app.use('/api/auth', authRoutes);
app.use('/api/sesiones', sesionesRoutes);

app.use(
  express.static(path.join(rootDir, 'app'), {
    etag: false,
    lastModified: false,
    cacheControl: false
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'app', 'dashboard-v2.html'));
});

app.get('/dashboard-v2.html', (req, res) => {
  res.sendFile(path.join(rootDir, 'app', 'dashboard-v2.html'));
});

app.get('/api/*', (req, res, next) => next());

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});

module.exports = app;
