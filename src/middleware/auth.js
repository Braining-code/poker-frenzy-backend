const { verificarToken } = require('../services/jwtService');

function autenticar(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      error: 'Token no proporcionado',
      code: 'NO_TOKEN'
    });
  }

  const token = authHeader.substring(7);
  const decoded = verificarToken(token);

  if (!decoded) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado',
      code: 'INVALID_TOKEN'
    });
  }

  req.user = decoded;
  next();
}

module.exports = { autenticar };
