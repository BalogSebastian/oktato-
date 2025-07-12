// Fájl: components/emails/PasswordResetEmail.tsx

import * as React from 'react';

interface PasswordResetEmailProps {
  resetLink: string;
}

export const PasswordResetEmail: React.FC<Readonly<PasswordResetEmailProps>> = ({ resetLink }) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f4f4f4' }}>
    <div style={{ maxWidth: '600px', margin: 'auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h1 style={{ color: '#333' }}>Jelszó Visszaállítása</h1>
      <p style={{ color: '#555', lineHeight: '1.6' }}>
        Kérést kaptunk a fiókjához tartozó jelszó visszaállítására. Ha nem Ön volt, hagyja figyelmen kívül ezt az e-mailt.
      </p>
      <p style={{ color: '#555', lineHeight: '1.6' }}>
        Új jelszó beállításához, kérjük, kattintson az alábbi gombra:
      </p>
      <a
        href={resetLink}
        style={{
          display: 'inline-block',
          padding: '12px 25px',
          margin: '20px 0',
          backgroundColor: '#dc3545',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontWeight: 'bold',
        }}
      >
        Új Jelszó Beállítása
      </a>
      <p style={{ color: '#888', fontSize: '12px' }}>
        A biztonsági link 1 órán keresztül érvényes.
      </p>
    </div>
  </div>
);