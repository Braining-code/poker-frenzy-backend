const bcrypt = require('bcryptjs');

// Hashea password con salt robusto
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

// Compara password con hash almacenado
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

// Código de verificación de 6 dígitos
function generarCodigoVerificacion() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

module.exports = {
  hashPassword,
  comparePassword,
  generarCodigoVerificacion
};
