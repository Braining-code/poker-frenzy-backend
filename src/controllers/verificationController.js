const { verificarCodigo } = require("../services/verificationService");
const { generarToken, generarRefreshToken } = require("../services/jwtService");

async function verifyEmailLink(req, res) {
  const { email, code } = req.query;

  if (!email || !code) {
    return res.send("Token inválido o incompleto.");
  }

  const result = await verificarCodigo(email, code);

  if (!result.ok) {
    return res.send(result.error);
  }

  const user = result.user;

  const token = generarToken(user.id, user.email, user.username);
  const refresh = generarRefreshToken(user.id);

  return res.redirect(
    `https://frenzy.poker/ingresar?token=${token}&refresh=${refresh}`
  );
}

module.exports = { verifyEmailLink };
