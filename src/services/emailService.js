const axios = require("axios");
const envConfig = require("../config/env");

async function enviarCodigoVerificacion(email, codigo) {
  const BREVO_KEY = envConfig.brevo.apiKey;

  const payload = {
    sender: {
      name: "Poker Frenzy",
      email: "mkt@pokerfrenzy.club"
    },
    to: [{ email }],
    templateId: 2, // TEMPLATE CORRECTO
    params: {
      email: email,
      verification_code: codigo
    }
  };

  const headers = {
    "api-key": BREVO_KEY,
    "accept": "application/json",
    "content-type": "application/json"
  };

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      { headers }
    );

    return response.data;
  } catch (error) {
    console.error("❌ ERROR BREVO:", error.response?.data || error.message);
    throw new Error("Error enviando email");
  }
}

module.exports = {
  enviarCodigoVerificacion
};

