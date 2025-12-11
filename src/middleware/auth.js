const { verificarToken } = require('../services/jwtService');

/**
 * Middleware de autenticación
 * Valida el token JWT y carga req.user
 */
function authenticateToken(req, res, next) {
  try {
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

    // Información validada del usuario
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username
    };

    return next();

  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(500).json({
      error: 'Error interno en autenticación',
      code: 'AUTH_ERROR'
    });
  }
}

module.exports = authenticateToken;
