// src/services/emailService.js
// ----------------------------------------------------
// ENVÍO DE EMAIL DE VERIFICACIÓN (BREVO + TEMPLATE 2)
// ----------------------------------------------------

const axios = require("axios");
const envConfig = require("../config/env");

async function enviarCodigoVerificacion(email, codigo) {
  const BREVO_KEY = envConfig.brevo.apiKey;

  try {
    const payload = {
      sender: {
        name: "Poker Frenzy",
        email: "mkt@pokerfrenzy.club"
      },
      templateId: 2,   // TEMPLATE CORRECTO
      to: [{ email }],
      params: {
        email: email,                // 🔥 NECESARIO para el magic link
        verification_code: codigo    // 🔥 NECESARIO para el magic link
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

    return response.data;

  } catch (error) {
    console.error("❌ ERROR EN BREVO:", error.response?.data || error);
    throw new Error("Error enviando email");
  }
}

module.exports = {
  enviarCodigoVerificacion
};
