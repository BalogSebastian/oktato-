// Fájl: components/emails/WelcomeEmail.tsx

import * as React from 'react';

interface WelcomeEmailProps {
  clientName: string;
  adminEmail: string;
  password: string;
  loginUrl: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  clientName,
  adminEmail,
  password,
  loginUrl,
}) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f4f4f4' }}>
    <div style={{ maxWidth: '600px', margin: 'auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h1 style={{ color: '#333' }}>Üdvözöljük a platformon, {clientName}!</h1>
      <p style={{ color: '#555', lineHeight: '1.6' }}>
        Sikeresen létrehoztuk adminisztrátori fiókját az Oktatási Platformunkon. Az alábbi adatokkal tud bejelentkezni:
      </p>
      <div style={{ backgroundColor: '#eee', padding: '15px', borderRadius: '5px', margin: '20px 0' }}>
        <p style={{ margin: '5px 0' }}><strong>E-mail cím:</strong> {adminEmail}</p>
        <p style={{ margin: '5px 0' }}><strong>Generált jelszó:</strong> <strong style={{ fontSize: '18px', color: '#000' }}>{password}</strong></p>
      </div>
      <p style={{ color: '#555', lineHeight: '1.6' }}>
        Javasoljuk, hogy az első bejelentkezés után változtassa meg a jelszavát.
      </p>
      <a
        href={loginUrl}
        style={{
          display: 'inline-block',
          padding: '12px 25px',
          margin: '20px 0',
          backgroundColor: '#007bff',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}
      >
        Bejelentkezés a Vezérlőpultra
      </a>
      <p style={{ color: '#888', fontSize: '12px' }}>
        Ha bármilyen kérdése van, keressen minket bizalommal.
      </p>
    </div>
  </div>
);