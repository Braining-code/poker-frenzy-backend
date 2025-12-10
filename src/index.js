// INDEX.JS — SAFE VERSION
// -------------------------------------
// Este archivo solo importa el servidor
// sin volver a ejecutar app.listen()
// -------------------------------------

require('dotenv').config();

// Importa el servidor ya configurado
require('./server');

// No hacemos app.listen() acá
console.log("▶️ Poker Frenzy backend inicializado (entry index.js)");
