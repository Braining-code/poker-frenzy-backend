const Brevo = require("@brevo/api");
const envConfig = require("../config/env");

const apiInstance = new Brevo.TransactionalEmailsApi();

// Configura la API KEY
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  envConfig.brevo.apiKey
);

async function enviarCodigoVerificacion(email, codigo) {
  try {
    const sendSmtpEmail = {
      sender: {
        name: envConfig.brevo.senderName,
        email: envConfig.brevo.senderEmail,
      },
      to: [{ email }],
      subject: "🎰 Verifica tu email - Poker Frenzy",
      htmlContent: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06B6D4 0%, #EC4899 50%, #A855F7 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">POKER FRENZY</h1>
          <p style="color: rgba(255,255,255,0.9); margin-top: 6px;">Verifica tu email para comenzar</p>
        </div>

        <div style="background: #f8f9fa; padding: 40px 30px; border: 1px solid #e9ecef; border-top: none; border-radius: 0 0 12px 12px;">
          <h2 style="color: #333; text-align: center;">Tu código de verificación:</h2>

          <div style="background: white; border: 3px solid #06B6D4; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px;">
            <div style="color: #06B6D4; letter-spacing: 8px; font-size: 42px; font-weight: bold; font-family: 'Courier New', monospace;">
              ${codigo}
            </div>
          </div>

          <p style="color: #777; text-align: center;">Código válido por 10 minutos</p>
        </div>
      </div>
      `,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log(`✅ Email de verificación enviado a: ${email}`);
    return response;
  } catch (error) {
    console.error("❌ Error al enviar email:", error.response?.body || error);
    throw new Error("Error enviando email");
  }
}

module.exports = {
  enviarCodigoVerificacion,
};
