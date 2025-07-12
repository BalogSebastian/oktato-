// Fájl: app/api/clients/create/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import Client from '@/lib/models/Client.model';
import * as bcrypt from 'bcrypt';
import { generate } from 'generate-password';
import * as z from 'zod';
import { Resend } from 'resend';
import { WelcomeEmail } from '@/components/emails/WelcomeEmail';
import React from 'react'; // <-- JAVÍTÁS: Importáljuk a React-et a típushoz

const resend = new Resend(process.env.RESEND_API_KEY);

const formSchema = z.object({
  clientName: z.string().min(2, { message: "A cégnévnek legalább 2 karakter hosszúnak kell lennie." }),
  adminEmail: z.string().email({ message: "Érvénytelen e-mail cím formátum." }),
  licenseCount: z.coerce.number().min(1, { message: "A licencek száma legalább 1." }),
  courseId: z.string().min(1, { message: "Oktatás kiválasztása kötelező." }),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      const firstError = validation.error.errors[0].message;
      return NextResponse.json({ message: firstError }, { status: 400 });
    }
    const { clientName, adminEmail, licenseCount, courseId } = validation.data;

    const existingUser = await User.findOne({ email: adminEmail }).select('_id').lean();
    if (existingUser) {
      return NextResponse.json({ message: 'Ez az e-mail cím már regisztrálva van.' }, { status: 409 });
    }

    const password = generate({ length: 12, numbers: true, symbols: true, strict: true });
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const session = await User.startSession();
    let newClient;

    await session.withTransaction(async () => {
      const newUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'CLIENT_ADMIN',
      });
      const savedUser = await newUser.save({ session });

      const client = new Client({
        name: clientName,
        adminUser: savedUser._id,
        subscribedCourses: [courseId],
        licenseCount: licenseCount,
      });
      newClient = await client.save({ session });

      savedUser.client = newClient._id;
      await savedUser.save({ session });
    });

    session.endSession();
    
    // E-MAIL KÜLDÉS LOGIKA
    try {
      await resend.emails.send({
        from: 'Oktatási Platform <noreply@keno-rendezvenyek.com>',
        to: [adminEmail],
        subject: 'Sikeres regisztráció az Oktatási Platformon!',
        // JAVÍTÁS: Explicit módon megmondjuk a TypeScriptnek, hogy ez egy React elem.
        react: WelcomeEmail({
          clientName: clientName,
          adminEmail: adminEmail,
          password: password,
          loginUrl: `${process.env.NEXTAUTH_URL}/login`
        }) as React.ReactElement,
      });
      console.log(`Üdvözlő e-mail sikeresen elküldve a(z) ${adminEmail} címre.`);
    } catch (emailError) {
      console.error("Hiba az e-mail küldése során:", emailError);
    }
    
    return NextResponse.json({ message: 'Ügyfél sikeresen létrehozva és e-mail elküldve!', client: newClient }, { status: 201 });

  } catch (error: any) {
    console.error("API Hiba:", error);
    const message = error.message || 'Szerverhiba történt.';
    return NextResponse.json({ message }, { status: 500 });
  }
}