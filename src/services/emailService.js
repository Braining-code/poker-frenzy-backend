const brevo = require('@getbrevo/brevo');
const envConfig = require('../config/env');

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.ApiKeyAuth, envConfig.brevo.apiKey);

async function enviarCodigoVerificacion(email, codigo) {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = '🎰 Verifica tu email - Poker Frenzy';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #06B6D4 0%, #EC4899 50%, #A855F7 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div style="font-size: 48px; margin-bottom: 10px;">🎰</div>
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">POKER FRENZY</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Verifica tu email para comenzar</p>
        </div>
        <div style="background: #f8f9fa; padding: 40px 30px; border-radius: 0 0 12px 12px; border: 1px solid #e9ecef; border-top: none;">
          <h2 style="color: #333; text-align: center; margin-top: 0; font-size: 24px;">¡Bienvenido a Poker Frenzy!</h2>
          <p style="color: #666; text-align: center; font-size: 16px; line-height: 1.6;">Tu código de verificación es:</p>
          
          <div style="background: white; border: 3px solid #06B6D4; padding: 30px; text-align: center; margin: 30px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(6,182,212,0.1);">
            <div style="color: #06B6D4; letter-spacing: 8px; margin: 0; font-size: 42px; font-weight: bold; font-family: 'Courier New', monospace;">${codigo}</div>
          </div>
          
          <p style="color: #999; text-align: center; font-size: 14px; margin: 20px 0;">
            ⏱️ Válido por 10 minutos
          </p>
          
          <div style="background: #f0f8ff; border-left: 4px solid #06B6D4; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="color: #0066cc; margin: 0; font-size: 13px;">
              💡 Si no solicitaste este código, puedes ignorar este email de forma segura.
            </p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              © 2024 Poker Frenzy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    `;
    sendSmtpEmail.sender = { 
      name: envConfig.brevo.senderName, 
      email: envConfig.brevo.senderEmail 
    };
    sendSmtpEmail.to = [{ email }];

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Email de verificación enviado a: ${email}`);
    return response;
  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

module.exports = {
  enviarCodigoVerificacion,
};
