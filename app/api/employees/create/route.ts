// Fájl: app/api/employees/create/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import Client from '@/lib/models/Client.model';
import * as z from 'zod';
import crypto from 'crypto';
import { Resend } from 'resend';
import { InvitationEmail } from '@/components/emails/InvitationEmail';
import React from 'react';

// JAVÍTÁS: Ellenőrizzük, hogy az API kulcs be van-e állítva
if (!process.env.RESEND_API_KEY) {
  console.error("Hiányzó Resend API kulcs! Az e-mail küldés nem fog működni.");
  console.error("Add hozzá a RESEND_API_KEY változót a .env.local fájlhoz.");
}
const resend = new Resend(process.env.RESEND_API_KEY);

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

    // JAVÍTÁS: Részletesebb hibakezelés és naplózás az e-mail küldésnél
    try {
      console.log(`E-mail küldésének megkísérlése a(z) ${email} címre...`);
      const { data, error } = await resend.emails.send({
        from: 'Oktatási Platform <noreply@keno-rendezvenyek.com>',
        to: [email],
        subject: `Meghívó a(z) ${client.name} oktatási felületére`,
        react: InvitationEmail({
          companyName: client.name,
          setPasswordUrl: setPasswordUrl,
        }) as React.ReactElement,
      });

      if (error) {
        // Ha a Resend API hibát ad vissza, azt naplózzuk és továbbdobjuk
        console.error("Resend API hiba:", error);
        throw new Error("Hiba történt az e-mail szolgáltatónál.");
      }

      console.log("E-mail sikeresen elküldve! ID:", data?.id);

    } catch (emailError) {
      // Itt minden egyéb, a küldés során felmerülő hibát elkapunk
      console.error("Váratlan hiba az e-mail küldése során:", emailError);
      // Visszaküldünk egy konkrét hibaüzenetet a felhasználónak
      return NextResponse.json({ message: 'A felhasználó létrejött, de a meghívó e-mailt nem sikerült elküldeni.' }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Munkavállaló sikeresen meghívva!', user: newUser }, { status: 201 });

  } catch (error: any) {
    console.error("API Hiba (Munkavállaló létrehozása):", error);
    return NextResponse.json({ message: 'Szerverhiba történt.' }, { status: 500 });
  }
}