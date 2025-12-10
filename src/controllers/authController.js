const db = require('../config/database');
const { hashPassword, comparePassword, generarCodigoVerificacion } = require('../services/cryptoService');
const { generarToken, generarRefreshToken, verificarRefreshToken } = require('../services/jwtService');
const { enviarCodigoVerificacion } = require('../services/emailService');
const { VERIFICATION_CODE_EXPIRY, PASSWORD_MIN_LENGTH } = require('../utils/constants');

async function register(req, res) {
  try {
    const { email, username, password, agreeTerms } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username y password requeridos', code: 'MISSING_FIELDS' });
    }

    if (!agreeTerms) {
      return res.status(400).json({ error: 'Debes aceptar los términos y condiciones', code: 'TERMS_NOT_ACCEPTED' });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({ error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`, code: 'PASSWORD_TOO_SHORT' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email inválido', code: 'INVALID_EMAIL' });
    }

    const existingEmail = await db.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Email ya registrado', code: 'EMAIL_EXISTS' });
    }

    const existingUsername = await db.query('SELECT id FROM users WHERE username = $1', [username.toLowerCase()]);
    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ error: 'Username ya existe', code: 'USERNAME_EXISTS' });
    }

    const passwordHash = await hashPassword(password);
    const codigo = generarCodigoVerificacion();
    const codigoExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

    const result = await db.query(
      `INSERT INTO users (email, username, password_hash, verification_code, verification_code_expires, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING id, email, username`,
      [email.toLowerCase(), username.toLowerCase(), passwordHash, codigo, codigoExpiry]
    );

    const user = result.rows[0];

    try {
      await enviarCodigoVerificacion(email, codigo);
    } catch (emailError) {
      console.error('Error enviando email:', emailError.message);
      await db.query('DELETE FROM users WHERE id = $1', [user.id]);
      return res.status(500).json({ error: 'Error al enviar email de verificación.', code: 'EMAIL_SEND_FAILED' });
    }

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Revisa tu email para verificar',
      userId: user.id,
      email: user.email
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ error: 'Error en el registro', code: 'REGISTER_ERROR' });
  }
}

async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email y código requeridos', code: 'MISSING_FIELDS' });
    }

    const result = await db.query(
      'SELECT id, username, verification_code, verification_code_expires FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    const user = result.rows[0];

    if (user.verification_code !== code) {
      return res.status(400).json({ error: 'Código incorrecto', code: 'INVALID_CODE' });
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({ error: 'Código expirado', code: 'CODE_EXPIRED' });
    }

    await db.query(
      'UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1',
      [user.id]
    );

    // 🔥 FIX ABSOLUTO → genera token + refresh como login
    const token = generarToken(user.id, email, user.username);
    const refreshToken = generarRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Email verificado exitosamente',
      token,
      refreshToken,
      user: {
        id: user.id,
        email,
        username: user.username
      }
    });

  } catch (error) {
    console.error('Error en verifyEmail:', error);
    res.status(500).json({ error: 'Error verificando email', code: 'VERIFY_ERROR' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y password requeridos', code: 'MISSING_FIELDS' });
    }

    const result = await db.query(
      'SELECT id, username, email_verified, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos', code: 'INVALID_CREDENTIALS' });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({ error: 'Email no verificado. Revisa tu correo.', code: 'EMAIL_NOT_VERIFIED' });
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos', code: 'INVALID_CREDENTIALS' });
    }

    const token = generarToken(user.id, email, user.username);
    const refreshToken = generarRefreshToken(user.id);

    await db.query('UPDATE users SET ultimo_login = NOW() WHERE id = $1', [user.id]);

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      refreshToken,
      user: {
        id: user.id,
        email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login', code: 'LOGIN_ERROR' });
  }
}

async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token requerido', code: 'MISSING_REFRESH_TOKEN' });
    }

    const decoded = verificarRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado', code: 'INVALID_REFRESH_TOKEN' });
    }

    const result = await db.query(
      'SELECT email, username FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado', code: 'USER_NOT_FOUND' });
    }

    const user = result.rows[0];
    const newToken = generarToken(decoded.userId, user.email, user.username);

    res.json({
      success: true,
      message: 'Token renovado',
      token: newToken
    });

  } catch (error) {
    console.error('Error en refresh:', error);
    res.status(500).json({ error: 'Error renovando token', code: 'REFRESH_ERROR' });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  refresh,
};
