// Fájl: components/emails/InvitationEmail.tsx

import * as React from 'react';

interface InvitationEmailProps {
  companyName: string;
  setPasswordUrl: string;
}

export const InvitationEmail: React.FC<Readonly<InvitationEmailProps>> = ({
  companyName,
  setPasswordUrl,
}) => (
  <div style={{ fontFamily: 'sans-serif', padding: '20px', backgroundColor: '#f4f4f4' }}>
    <div style={{ maxWidth: '600px', margin: 'auto', backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
      <h1 style={{ color: '#333' }}>Meghívó az Oktatási Platformra</h1>
      <p style={{ color: '#555', lineHeight: '1.6' }}>
        A(z) **{companyName}** meghívta Önt, hogy csatlakozzon az Oktatási Platformhoz.
      </p>
      <p style={{ color: '#555', lineHeight: '1.6' }}>
        A hozzáféréshez, kérjük, állítsa be a jelszavát az alábbi gombra kattintva:
      </p>
      <a
        href={setPasswordUrl}
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
        Jelszó Beállítása
      </a>
      <p style={{ color: '#888', fontSize: '12px' }}>
        A link 24 órán keresztül érvényes. Ha bármilyen kérdése van, keresse a felettesét.
      </p>
    </div>
  </div>
);