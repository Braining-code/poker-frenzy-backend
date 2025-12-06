const jwt = require('jsonwebtoken');
const envConfig = require('../config/env');

function generarToken(userId, email, username) {
  return jwt.sign(
    { userId, email, username },
    envConfig.jwt.secret,
    { expiresIn: envConfig.jwt.expiresIn }
  );
}

function generarRefreshToken(userId) {
  return jwt.sign(
    { userId },
    envConfig.jwt.refreshSecret,
    { expiresIn: envConfig.jwt.refreshExpiresIn }
  );
}

function verificarToken(token) {
  try {
    return jwt.verify(token, envConfig.jwt.secret);
  } catch (error) {
    console.error('❌ Token inválido:', error.message);
    return null;
  }
}

function verificarRefreshToken(token) {
  try {
    return jwt.verify(token, envConfig.jwt.refreshSecret);
  } catch (error) {
    console.error('❌ Refresh token inválido:', error.message);
    return null;
  }
}

module.exports = {
  generarToken,
  generarRefreshToken,
  verificarToken,
  verificarRefreshToken,
};
