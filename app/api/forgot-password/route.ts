// app/api/forgot-password/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import crypto from 'crypto';
import { sendEmail } from '@/lib/services/sendgrid';
import { passwordResetEmailTemplate } from '@/lib/emails/templates';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: 'E-mail cím megadása kötelező.' }, { status: 400 });
    }

    const user = await User.findOne({ email });
    
    // Biztonsági okokból akkor is sikeres üzenetet küldünk vissza, ha nincs ilyen felhasználó
    if (user) {
      // Generáljuk a tokent és a lejárati időt (1 óra)
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
      user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 óra
      
      await user.save();

      const resetLink = `${process.env.NEXTAUTH_URL}/set-password/${resetToken}`;
      
      // SendGrid email küldés
      try {
        const emailHtml = passwordResetEmailTemplate(resetLink);
        
        await sendEmail({
          to: user.email,
          subject: 'Jelszó visszaállítása az Oktatási Platformon',
          html: emailHtml
        });
        
        console.log(`Jelszó visszaállító email elküldve: ${user.email}`);
      } catch (emailError) {
        console.error("Email küldési hiba:", emailError);
        // Itt nem dobunk hibát, hogy ne áruljuk el, létezik-e az email
      }
    }

    return NextResponse.json({ 
      message: 'Ha a megadott e-mail cím regisztrálva van, kiküldtünk rá egy linket.' 
    });

  } catch (error) {
    console.error("API Hiba (Elfelejtett jelszó):", error);
    return NextResponse.json({ message: 'Szerverhiba történt.' }, { status: 500 });
  }
}