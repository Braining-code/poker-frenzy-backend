require('dotenv').config();
const app = require('./server');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════╗
  ║   🎰 POKER FRENZY BACKEND v1.0    ║
  ║   ✅ Servidor corriendo en puerto ${PORT}    ║
  ║   🌍 http://localhost:${PORT}         ║
  ╚════════════════════════════════════╝
  `);
});
