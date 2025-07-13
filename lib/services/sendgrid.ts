// lib/services/sendgrid.ts
import sgMail from '@sendgrid/mail';

// Inicializáljuk a SendGrid-et
if (!process.env.SENDGRID_API_KEY) {
  console.error("Hiányzó SendGrid API kulcs!");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  const msg = {
    to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@platform.hu',
      name: process.env.SENDGRID_FROM_NAME || 'Oktatási Platform'
    },
    subject,
    html,
  };

  try {
    const [response] = await sgMail.send(msg);
    console.log(`Email sikeresen elküldve ${to} címre. Status: ${response.statusCode}`);
    return { success: true, messageId: response.headers['x-message-id'] };
  } catch (error: any) {
    console.error('SendGrid hiba:', error);
    
    // Részletesebb hibakezelés
    if (error.response) {
      console.error('SendGrid válasz hiba:', error.response.body);
    }
    
    throw new Error(error.message || 'Email küldési hiba');
  }
}