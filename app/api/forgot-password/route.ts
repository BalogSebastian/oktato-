// Fájl: app/api/forgot-password/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import crypto from 'crypto';
import { Resend } from 'resend';
import { PasswordResetEmail } from '@/components/emails/PasswordResetEmail';
import React from 'react';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'E-mail cím megadása kötelező.' }, { status: 400 });
    }

    const user = await User.findOne({ email });

    // Biztonsági okokból akkor is sikeres üzenetet küldünk vissza, ha nincs ilyen felhasználó,
    // hogy ne lehessen kitalálni, mely e-mail címek léteznek a rendszerben.
    if (user) {
      // Generáljuk a tokent és a lejárati időt (1 óra)
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 óra
      await user.save();

      const resetLink = `${process.env.NEXTAUTH_URL}/set-password/${resetToken}`;

      await resend.emails.send({
        from: `Oktatási Platform <noreply@${process.env.RESEND_DOMAIN}>`, // Használjuk a hitelesített domaint
        to: [user.email],
        subject: 'Jelszó visszaállítása az Oktatási Platformon',
        react: PasswordResetEmail({ resetLink }) as React.ReactElement,
      });
    }

    return NextResponse.json({ message: 'Ha a megadott e-mail cím regisztrálva van, kiküldtünk rá egy linket.' });

  } catch (error) {
    console.error("API Hiba (Elfelejtett jelszó):", error);
    // Általános hibaüzenet, hogy ne szivárogjanak ki belső információk
    return NextResponse.json({ message: 'Szerverhiba történt.' }, { status: 500 });
  }
}