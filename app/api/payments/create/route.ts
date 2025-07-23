// app/api/payments/create/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Client from '@/lib/models/Client.model';
import Payment from '@/lib/models/Payment.model';
import * as z from 'zod';
import mongoose from 'mongoose';

const purchaseSchema = z.object({
  packageType: z.enum(['5_LICENSES', '10_LICENSES', '15_LICENSES', '20_LICENSES', 'CUSTOM'], {
    message: "Érvénytelen csomagtípus."
  }),
  customLicenses: z.coerce.number().int().min(1, { message: "Az egyedi licensz száma legalább 1." }).optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Csak CLIENT_ADMIN jogosultsággal és hozzárendelt klienssel
    if (!session || session.user?.role !== 'CLIENT_ADMIN' || !session.user?.client) {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = purchaseSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { packageType, customLicenses } = validation.data;

    let licensesToAdd = 0;
    let amount = 0; // Szimulált összeg

    switch (packageType) {
      case '5_LICENSES': licensesToAdd = 5; amount = 50; break;
      case '10_LICENSES': licensesToAdd = 10; amount = 90; break;
      case '15_LICENSES': licensesToAdd = 15; amount = 120; break;
      case '20_LICENSES': licensesToAdd = 20; amount = 150; break;
      case 'CUSTOM':
        if (customLicenses === undefined) {
          return NextResponse.json({ message: 'Az egyedi licenszek számának megadása kötelező.' }, { status: 400 });
        }
        licensesToAdd = customLicenses;
        amount = customLicenses * 10; // Példa árképzés
        break;
    }

    await dbConnect();

    const dbSession = await mongoose.startSession();
    await dbSession.withTransaction(async () => {
      // 1. Kliens licenszszámának frissítése
      const client = await Client.findById(session.user.client).session(dbSession);
      if (!client) {
        throw new Error("A kliens nem található.");
      }
      client.licenseCount += licensesToAdd;
      await client.save({ session: dbSession });

      // 2. Fizetési rekord létrehozása
      await Payment.create([{
        client: client._id,
        user: session.user.id,
        amount: amount,
        licensesAdded: licensesToAdd,
        packageType: packageType,
        status: 'completed', // Egyszerűsítve: sikeresnek vesszük
      }], { session: dbSession });
    });
    dbSession.endSession();

    return NextResponse.json({ 
      message: 'Licenszcsomag sikeresen megvásárolva és hozzáadva!', 
      newLicenseCount: licensesToAdd 
    }, { status: 200 });

  } catch (error: any) {
    console.error("API Hiba (Vásárlás):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}