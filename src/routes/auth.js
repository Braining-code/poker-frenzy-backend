// ==========================================
// IMPORTS
// ==========================================
const db = require('../config/database');
const {
  hashPassword,
  comparePassword,
  generarCodigoVerificacion
} = require('../services/cryptoService');

const {
  generarToken,
  generarRefreshToken,
  verificarRefreshToken
} = require('../services/jwtService');

const { enviarCodigoVerificacion } = require('../services/emailService');
const { VERIFICATION_CODE_EXPIRY, PASSWORD_MIN_LENGTH } = require('../utils/constants');

const authenticateToken = require('../middleware/auth');
const router = require('express').Router();

// ==========================================
// REGISTER
// ==========================================
async function register(req, res) {
  try {
    const { email, username, password, agreeTerms } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Email, username y password requeridos" });
    }

    if (!agreeTerms) {
      return res.status(400).json({ error: "Debes aceptar los términos y condiciones" });
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      return res.status(400).json({
        error: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      });
    }

    const emailNorm = email.toLowerCase().trim();
    const usernameNorm = username.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailNorm)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    const emailExists = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [emailNorm]
    );
    if (emailExists.rows.length > 0) {
      return res.status(400).json({ error: "Email ya registrado" });
    }

    const usernameExists = await db.query(
      "SELECT id FROM users WHERE username = $1",
      [usernameNorm]
    );
    if (usernameExists.rows.length > 0) {
      return res.status(400).json({ error: "Username ya existe" });
    }

    const passwordHash = await hashPassword(password);
    const codigo = generarCodigoVerificacion();
    const codigoExpiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

    const result = await db.query(
      `INSERT INTO users 
       (email, username, password_hash, verification_code, verification_code_expires, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, username`,
      [emailNorm, usernameNorm, passwordHash, codigo, codigoExpiry]
    );

    try {
      await enviarCodigoVerificacion(emailNorm, codigo);
    } catch (err) {
      await db.query("DELETE FROM users WHERE id = $1", [result.rows[0].id]);
      return res.status(500).json({ error: "Error enviando email de verificación" });
    }

    return res.status(201).json({
      success: true,
      message: "Registro exitoso. Revisa tu email",
      email: emailNorm
    });

  } catch (error) {
    console.error("Error en register:", error);
    return res.status(500).json({ error: "Error en el registro" });
  }
}

// ==========================================
// RESEND VERIFICATION LINK
// ==========================================
async function resendVerification(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email requerido" });
    }

    const emailNorm = email.toLowerCase().trim();

    const result = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];
    const codigo = generarCodigoVerificacion();
    const expiry = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

    await db.query(
      `UPDATE users 
       SET verification_code = $1, verification_code_expires = $2
       WHERE id = $3`,
      [codigo, expiry, user.id]
    );

    await enviarCodigoVerificacion(emailNorm, codigo);

    return res.json({
      success: true,
      message: "Link reenviado correctamente"
    });

  } catch (error) {
    console.error("Error en resendVerification:", error);
    return res.status(500).json({ error: "Error reenviando código" });
  }
}

// ==========================================
// VERIFY EMAIL — POST LEGACY
// ==========================================
async function verifyEmail(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email y código requeridos" });
    }

    const emailNorm = email.toLowerCase().trim();

    const result = await db.query(
      `SELECT id, verification_code, verification_code_expires, username
       FROM users WHERE email = $1`,
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Usuario no encontrado" });
    }

    const user = result.rows[0];

    if (user.verification_code !== code) {
      return res.status(400).json({ error: "Código incorrecto" });
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).json({ error: "Código expirado" });
    }

    await db.query(
      `UPDATE users
       SET email_verified = true, verification_code = NULL, verification_code_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    const token = generarToken(user.id, emailNorm, user.username);
    const refreshToken = generarRefreshToken(user.id);

    return res.json({
      success: true,
      message: "Verificado correctamente",
      token,
      refreshToken
    });

  } catch (error) {
    console.error("Error en verifyEmail:", error);
    return res.status(500).json({ error: "Error verificando email" });
  }
}

// ==========================================
// LOGIN
// ==========================================
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const emailNorm = email.toLowerCase().trim();

    const result = await db.query(
      `SELECT id, username, email_verified, password_hash
       FROM users WHERE email = $1`,
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(403).json({ error: "Email no verificado" });
    }

    const match = await comparePassword(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Email o contraseña incorrectos" });
    }

    const token = generarToken(user.id, emailNorm, user.username);
    const refreshToken = generarRefreshToken(user.id);

    return res.json({
      success: true,
      message: "Login exitoso",
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: emailNorm
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: "Error en el login" });
  }
}

// ==========================================
// REFRESH TOKEN
// ==========================================
async function refresh(req, res) {
  try {
    const { refreshToken } = req.body;

    const decoded = verificarRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: "Refresh token inválido" });
    }

    const result = await db.query(
      `SELECT email, username FROM users WHERE id = $1`,
      [decoded.userId]
    );

    const user = result.rows[0];
    const newToken = generarToken(decoded.userId, user.email, user.username);

    return res.json({
      success: true,
      token: newToken
    });

  } catch (error) {
    console.error("Error en refresh:", error);
    return res
      .status(500)
      .json({ error: "Error renovando token" });
  }
}

// ==========================================
// GET /me
// ==========================================
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, email, username, email_verified
       FROM users WHERE id = $1`,
      [req.user.userId]
    );

    return res.json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Error en /me:", error);
    return res.status(500).json({ error: "Error obteniendo usuario" });
  }
});

// ==========================================
// MAGIC LINK - ACTUALIZADO PARA app.frenzy.poker
// ==========================================
router.get("/verify-email-link", async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    let { email, code } = req.query;

    if (!email || !code) {
      return res.status(400).send("Token inválido o incompleto.");
    }

    const emailNorm = email.toLowerCase().trim();

    const result = await db.query(
      `SELECT id, username, verification_code, verification_code_expires
       FROM users WHERE email = $1`,
      [emailNorm]
    );

    if (result.rows.length === 0) {
      return res.status(400).send("Usuario no encontrado.");
    }

    const user = result.rows[0];

    if (user.verification_code !== code) {
      return res.status(400).send("Código incorrecto.");
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.status(400).send("Código expirado.");
    }

    await db.query(
      `UPDATE users 
       SET email_verified = true, verification_code = NULL, verification_code_expires = NULL
       WHERE id = $1`,
      [user.id]
    );

    const token = generarToken(user.id, emailNorm, user.username);
    const refresh = generarRefreshToken(user.id);

    // 🔥 CAMBIO: Redirige a app.frenzy.poker con hash
    return res.redirect(
      `https://app.frenzy.poker#token=${encodeURIComponent(token)}&refresh=${encodeURIComponent(refresh)}`
    );

  } catch (error) {
    console.error("Error en verify-email-link:", error);
    return res.status(500).send("Error interno al activar la cuenta.");
  }
});

// ==========================================
// RUTAS PÚBLICAS
// ==========================================
router.post("/register", register);
router.post("/register/resend", resendVerification);
router.post("/verify-email", verifyEmail);
router.post("/login", login);
router.post("/refresh", refresh);

module.exports = router;
