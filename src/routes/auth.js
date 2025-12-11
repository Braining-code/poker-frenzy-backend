router.get('/verify-email-link', async (req, res) => {
  try {
    const { email, code } = req.query;

    if (!email || !code) {
      return res.send("Token inválido o incompleto.");
    }

    const result = await db.query(
      'SELECT id, username, verification_code, verification_code_expires FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.send("Usuario no encontrado.");
    }

    const user = result.rows[0];

    if (user.verification_code !== code) {
      return res.send("Código incorrecto.");
    }

    if (new Date() > new Date(user.verification_code_expires)) {
      return res.send("Código expirado.");
    }

    await db.query(
      'UPDATE users SET email_verified = true, verification_code = NULL, verification_code_expires = NULL WHERE id = $1',
      [user.id]
    );

    const token = generarToken(user.id, email, user.username);
    const refresh = generarRefreshToken(user.id);

    return res.redirect(
      `https://pokerfrenzy.club/ingresar?token=${encodeURIComponent(token)}&refresh=${encodeURIComponent(refresh)}`
    );

  } catch (error) {
    console.error("Error en verify-email-link:", error);
    return res.send("Error interno al activar la cuenta.");
  }
});
