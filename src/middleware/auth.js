const { verificarToken } = require('../services/jwtService');

/**
 * Middleware de autenticación
 * Valida el token JWT y carga req.user
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token no proporcionado',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verificarToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }

  // Ej: decoded = { userId, email, username, iat, exp }
  req.user = decoded;

  next();
}

module.exports = { authenticateToken };
