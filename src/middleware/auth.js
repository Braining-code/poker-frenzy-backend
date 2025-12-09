const { verificarToken } = require('../services/jwtService');

module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  // No hay header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token no proporcionado',
      code: 'NO_TOKEN'
    });
  }

  // Extraer token
  const token = authHeader.split(' ')[1];
  const decoded = verificarToken(token);

  // Token inválido o expirado
  if (!decoded) {
    return res.status(401).json({
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }

  // Guardar datos del usuario para el endpoint que sigue
  // decoded = { userId, email, username }
  req.user = decoded;

  next();
};
