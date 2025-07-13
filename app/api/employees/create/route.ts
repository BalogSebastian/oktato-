// app/api/employees/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import Client from '@/lib/models/Client.model';
import * as z from 'zod';
import crypto from 'crypto';
import { sendEmail } from '@/lib/services/sendgrid';
import { invitationEmailTemplate } from '@/lib/emails/templates';

export const runtime = 'nodejs';

const formSchema = z.object({
  email: z.string().email({ message: "Érvénytelen e-mail cím." }),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'CLIENT_ADMIN' || !session.user?.client) {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    
    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }
    const { email } = validation.data;

    const client = await Client.findById(session.user.client);
    if (!client) {
      return NextResponse.json({ message: 'A cég nem található.' }, { status: 404 });
    }

    const employeeCount = await User.countDocuments({ client: client._id, role: 'USER' });
    if (employeeCount >= client.licenseCount) {
      return NextResponse.json({ message: 'Nincs több szabad licensz.' }, { status: 409 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Ez az e-mail cím már regisztrálva van a rendszerben.' }, { status: 409 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newUser = await User.create({
      email,
      role: 'USER',
      client: client._id,
      passwordResetToken,
      passwordResetExpires,
    });

    const setPasswordUrl = `${process.env.NEXTAUTH_URL}/set-password/${resetToken}`;

    // SendGrid email küldés
    try {
      console.log(`E-mail küldésének megkísérlése a(z) ${email} címre...`);
      
      const emailHtml = invitationEmailTemplate(client.name, setPasswordUrl);
      
      const result = await sendEmail({
        to: email,
        subject: `Meghívó a(z) ${client.name} oktatási felületére`,
        html: emailHtml
      });

      console.log("E-mail sikeresen elküldve! ID:", result.messageId);

    } catch (emailError: any) {
      console.error("Hiba az e-mail küldése során:", emailError);
      // Itt is dönthetünk: törölhetjük az új user-t, vagy megtartjuk
      return NextResponse.json({ 
        message: 'A felhasználó létrejött, de a meghívó e-mailt nem sikerült elküldeni.',
        error: emailError.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Munkavállaló sikeresen meghívva!', user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error("API Hiba (Munkavállaló létrehozása):", error);
    return NextResponse.json({ message: 'Szerverhiba történt.' }, { status: 500 });
  }
}