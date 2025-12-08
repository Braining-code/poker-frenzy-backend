const axios = require("axios");
const envConfig = require("../config/env");

// ------------------------------------
// ENV
// ------------------------------------
async function enviarCodigoVerificacion(email, token) {
  const BREVO_KEY = envConfig.brevo.apiKey;

  // ENLACE DE VERIFICACIÓN
  const verificationLink = `https://pokerfrenzy.club/verify?token=${token}`;

  // ------------------------------------
  // LOGS PARA DEBUG
  // ------------------------------------
  console.log("----------------------------------------------------");
  console.log("🔍 DEBUG BREVO");
  console.log("🔑 BREVO_KEY ESTÁ CARGADA?:", BREVO_KEY ? "SI" : "NO");
  console.log("🔑 BREVO_KEY VALOR:", BREVO_KEY);
  console.log("📩 Enviando email a:", email);
  console.log("🔗 verificationLink:", verificationLink);
  console.log("----------------------------------------------------");

  try {
    const payload = {
      templateId: 1, // ID DEL TEMPLATE EN BREVO
      to: [{ email }],
      params: {
        verification_link: verificationLink,
      },
    };

    const headers = {
      "api-key": BREVO_KEY,
      "accept": "application/json",
      "content-type": "application/json",
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers }
    );

    console.log(`✔️ Email de verificación enviado a: ${email}`);
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
