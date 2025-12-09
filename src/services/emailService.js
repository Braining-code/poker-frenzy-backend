// src/services/emailService.js
// ----------------------------------------------------
// ENVÍO DE EMAIL DE VERIFICACIÓN (BREVO + TEMPLATE 2)
// ----------------------------------------------------

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

  // 🔥 URL FINAL QUE IRÁ EN EL EMAIL
  const magic_link = `https://pokerfrenzy.club/activar?email=${encodeURIComponent(email)}&code=${encodeURIComponent(codigo)}`;

  try {
    const payload = {
      sender: {
        name: "Poker Frenzy",
        email: "mkt@pokerfrenzy.club"
      },
      templateId: 2, // Template correcto
      to: [{ email }],
      params: {
        verification_code: codigo,  // Por si lo necesitas textual
        magic_link                // 🔥 ESTA ES LA VARIABLE QUE BREVO REMPLAZA EN {{ magic_link }}
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

    console.log(`✔️ Email de verificación enviado a: ${email}`);
    console.log("🔗 Magic link enviado:", magic_link);

    return response.data;

  } catch (error) {
    console.log("----------------------------------------------------");
    console.error("❌ ERROR EN BREVO:", error.response?.data || error);
    console.log("----------------------------------------------------");
    throw new Error("Error enviando email");
  }
}

module.exports = {
  enviarCodigoVerificacion
};
