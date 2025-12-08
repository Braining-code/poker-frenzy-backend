const axios = require("axios");
const envConfig = require("../config/env");

async function enviarCodigoVerificacion(email, codigo) {
  const BREVO_KEY = envConfig.brevo.apiKey;

  console.log("----------------------------------------------------");
  console.log("🔍 DEBUG BREVO");
  console.log("🔑 BREVO_KEY:", BREVO_KEY ? "SI" : "NO");
  console.log("📩 Enviando email a:", email);
  console.log("🔢 Código:", codigo);
  console.log("----------------------------------------------------");

  try {
    const payload = {
      templateId: 2,   // <-- ID DEL TEMPLATE NUEVO EN ESPAÑOL
      to: [{ email }],
      params: {
        verification_code: codigo   // <-- AHORA SÍ ENVÍA EL CÓDIGO
      }
    };

    const headers = {
      "api-key": BREVO_KEY,
      "accept": "application/json",
      "content-type": "application/json"
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers }
    );

    console.log(`✔️ Email enviado a: ${email}`);
    return response.data;

  } catch (error) {
    console.log("----------------------------------------------------");
    console.error("❌ ERROR EN BREVO:", error.response?.data || error);
    console.log("----------------------------------------------------");
    throw new Error("Error enviando email");
  }
}

module.exports = {
  enviarCodigoVerificacion,
};
