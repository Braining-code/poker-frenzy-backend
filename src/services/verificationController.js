const { verificarCodigo } = require("../services/verificationService");

async function verifyEmailLink(req, res) {
  try {
    const { email, code } = req.query;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: "Faltan parámetros"
      });
    }

    const result = await verificarCodigo(email, code);

    if (!result.ok) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    return res.json({
      success: true,
      message: "Email verificado correctamente"
    });

  } catch (error) {
    console.error("Verify link error:", error);
    return res.status(500).json({
      success: false,
      message: "Error interno"
    });
  }
}

module.exports = { verifyEmailLink };
