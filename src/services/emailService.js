const axios = require("axios");
const envConfig = require("../config/env");

async function enviarCodigoVerificacion(email, token) {
  const BREVO_KEY = envConfig.brevo.apiKey;

  const verificationLink = `https://pokerfrenzy.club/verify?token=${token}`;

  try {
    const payload = {
      sender: {
        email: "german.catzman@gmail.com",  // remitente verificado en Brevo
        name: "Poker Frenzy"
      },
      templateId: 1, // ID de la plantilla Brevo
      to: [{ email }],
      params: {
        verification_link: verificationLink
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
    return response.data;

  } catch (error) {
    console.error("❌ Error al enviar email:", error.response?.data || error);
    throw new Error("Error enviando email");
  }
}

module.exports = {
  enviarCodigoVerificacion,
};

module.exports = {
  enviarCodigoVerificacion,
};
