const jwt = require('jsonwebtoken');
const envConfig = require('../config/env');

// Token de acceso (incluye email + username)
function generarToken(userId, email, username) {
  return jwt.sign(
    { userId, email, username },
    envConfig.jwt.secret,
    {
      expiresIn: envConfig.jwt.expiresIn,
      issuer: "pokerfrenzy",
      audience: userId.toString()
    }
  );
}

// Refresh token (solo userId)
function generarRefreshToken(userId) {
  return jwt.sign(
    { userId },
    envConfig.jwt.refreshSecret,
    {
      expiresIn: envConfig.jwt.refreshExpiresIn,
      issuer: "pokerfrenzy-refresh",
      audience: userId.toString()
    }
  );
}

// Verifica token normal
function verificarToken(token) {
  try {
    return jwt.verify(token, envConfig.jwt.secret);
  } catch {
    return null;
  }
}

// Verifica refresh token
function verificarRefreshToken(token) {
  try {
    return jwt.verify(token, envConfig.jwt.refreshSecret);
  } catch {
    return null;
  }
}

module.exports = {
  generarToken,
  generarRefreshToken,
  verificarToken,
  verificarRefreshToken
};
