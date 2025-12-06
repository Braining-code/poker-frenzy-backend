const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const { enviarCodigoVerificacion } = require("../services/emailService");


// =========================
// REGISTER
// =========================
exports.register = async (req, res) => {
  try {
    const { email, username, password, agreeTerms } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    if (!agreeTerms) {
      return res.status(400).json({ error: "Debes aceptar los términos" });
    }

    // Verificar existencia
    const existe = await db.query(
      "SELECT id FROM users WHERE email = $1 OR username = $2",
      [email, username]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El email o usuario ya existe" });
    }

    // Encriptar password
    const hashed = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevo = await db.query(
      `INSERT INTO users (email, username, password)
       VALUES ($1, $2, $3)
       RETURNING id, email, username`,
      [email, username, hashed]
    );

    const user = nuevo.rows[0];

    // Generar código email
    const codigo = Math.floor(100000 + Math.random() * 900000);

    await db.query(
      `INSERT INTO email_verifications (user_id, code)
       VALUES ($1, $2)`,
      [user.id, codigo]
    );

    // Enviar email con Brevo
    await enviarCodigoVerificacion(email, codigo);

    return res.json({
      ok: true,
      message: "Usuario registrado. Verifica tu email.",
      user,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ error: "Error interno" });
  }
};



// =========================
// VERIFY EMAIL
// =========================
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Datos incompletos" });
    }

    // Buscar usuario
    const u = await db.query("SELECT id FROM users WHERE email = $1", [email]);

    if (u.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const userId = u.rows[0].id;

    // Verificar código
    const verif = await db.query(
      "SELECT code FROM email_verifications WHERE user_id = $1 ORDER BY id DESC LIMIT 1",
      [userId]
    );

    if (!verif.rows.length || verif.rows[0].code !== code) {
      return res.status(400).json({ error: "Código incorrecto" });
    }

    // Marcar email como verificado
    await db.query(
      "UPDATE users SET email_verified = TRUE WHERE id = $1",
      [userId]
    );

    return res.json({ ok: true, message: "Email verificado correctamente" });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};



// =========================
// LOGIN
// =========================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const q = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (!q.rows.length) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const user = q.rows[0];

    // Check password
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id }, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    const refreshToken = jwt.sign({ id: user.id }, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });

    return res.json({ ok: true, token, refreshToken });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Error interno" });
  }
};



// =========================
// REFRESH TOKEN
// =========================
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken)
      return res.status(400).json({ error: "Falta refreshToken" });

    jwt.verify(refreshToken, env.jwt.refreshSecret, (err, data) => {
      if (err) return res.status(401).json({ error: "Refresh token inválido" });

      const newToken = jwt.sign(
        { id: data.id },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
      );

      return res.json({ ok: true, token: newToken });
    });

  } catch (err) {
    console.error("REFRESH ERROR:", err);
    res.status(500).json({ error: "Error interno" });
  }
};
