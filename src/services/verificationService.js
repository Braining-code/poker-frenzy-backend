const db = require("../config/database");

async function verificarCodigo(email, code) {
  // 1) Buscar usuario por email
  const result = await db.query(
    "SELECT * FROM users WHERE email = $1",
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    return { ok: false, error: "Usuario no encontrado" };
  }

  const user = result.rows[0];

  // 2) Comparar código (no estricta para evitar problemas de tipo)
  if (user.verification_code != code) {
    return { ok: false, error: "Código inválido" };
  }

  // 3) Validar expiración
  if (new Date() > new Date(user.verification_code_expires)) {
    return { ok: false, error: "Código expirado" };
  }

  // 4) Actualizar usuario como verificado
  await db.query(
    `UPDATE users 
     SET email_verified = true, 
         verification_code = NULL, 
         verification_code_expires = NULL 
     WHERE id = $1`,
    [user.id]
  );

  return { ok: true };
}

module.exports = { verificarCodigo };
