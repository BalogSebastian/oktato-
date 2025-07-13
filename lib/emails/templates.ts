// lib/emails/templates.ts
// Email template-ek SendGrid-hez

export function welcomeEmailTemplate(clientName: string, adminEmail: string, password: string, loginUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Üdvözöljük a platformon</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #007bff; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Üdvözöljük a platformon!</h1>
          </div>
          
          <div style="padding: 30px;">
            <h2 style="color: #333; margin-bottom: 20px;">Kedves ${clientName}!</h2>
            
            <p style="margin-bottom: 20px;">
              Sikeresen létrehoztuk adminisztrátori fiókját az Oktatási Platformunkon. 
              Az alábbi adatokkal tud bejelentkezni:
            </p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>E-mail cím:</strong> ${adminEmail}</p>
              <p style="margin: 5px 0;"><strong>Generált jelszó:</strong> <span style="font-size: 18px; color: #dc3545; font-weight: bold;">${password}</span></p>
            </div>
            
            <p style="margin-bottom: 20px;">
              <strong>Fontos:</strong> Javasoljuk, hogy az első bejelentkezés után változtassa meg a jelszavát!
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Bejelentkezés a Vezérlőpultra
              </a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Ha bármilyen kérdése van, keressen minket bizalommal.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  export function invitationEmailTemplate(companyName: string, setPasswordUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Meghívó az Oktatási Platformra</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #28a745; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Meghívó az Oktatási Platformra</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="margin-bottom: 20px;">
              A(z) <strong>${companyName}</strong> meghívta Önt, hogy csatlakozzon az Oktatási Platformhoz.
            </p>
            
            <p style="margin-bottom: 20px;">
              A hozzáféréshez, kérjük, állítsa be a jelszavát az alábbi gombra kattintva:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${setPasswordUrl}" style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Jelszó Beállítása
              </a>
            </div>
            
            <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #856404;">
                <strong>Figyelem:</strong> A link 24 órán keresztül érvényes.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Ha bármilyen kérdése van, keresse a felettesét.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  
  export function passwordResetEmailTemplate(resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jelszó Visszaállítása</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="background-color: #dc3545; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Jelszó Visszaállítása</h1>
          </div>
          
          <div style="padding: 30px;">
            <p style="margin-bottom: 20px;">
              Kérést kaptunk a fiókjához tartozó jelszó visszaállítására. 
              Ha nem Ön volt, hagyja figyelmen kívül ezt az e-mailt.
            </p>
            
            <p style="margin-bottom: 20px;">
              Új jelszó beállításához, kérjük, kattintson az alábbi gombra:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Új Jelszó Beállítása
              </a>
            </div>
            
            <div style="background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <p style="margin: 0; color: #721c24;">
                <strong>Biztonsági figyelmeztetés:</strong> A link 1 órán keresztül érvényes.
              </p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Ha nem Ön kérte a jelszó visszaállítást, kérjük hagyja figyelmen kívül ezt az emailt.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }