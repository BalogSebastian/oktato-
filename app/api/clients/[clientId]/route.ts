// Fájl: app/api/clients/[clientId]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import Client from '@/lib/models/Client.model';
import mongoose from 'mongoose';

export async function DELETE(
  request: Request,
  { params }: { params: { clientId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Jogosultság ellenőrzés
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    const { clientId } = params;
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return NextResponse.json({ message: 'Érvénytelen ügyfél azonosító.' }, { status: 400 });
    }

    await dbConnect();

    const dbSession = await mongoose.startSession();
    let deletedClient;

    // 2. Tranzakciót használunk, hogy minden törlés sikeres legyen, vagy egyik se
    await dbSession.withTransaction(async () => {
      // 3. Töröljük az összes felhasználót, aki ehhez a céghez tartozik
      await User.deleteMany({ client: clientId }, { session: dbSession });

      // 4. Töröljük magát a céget
      deletedClient = await Client.findByIdAndDelete(clientId, { session: dbSession });

      if (!deletedClient) {
        throw new Error("Az ügyfél nem található, a törlés sikertelen.");
      }
    });

    dbSession.endSession();

    return NextResponse.json({ message: 'Ügyfél és a hozzá tartozó felhasználók sikeresen törölve.' });

  } catch (error: any) {
    console.error("API Hiba (Ügyfél törlése):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}