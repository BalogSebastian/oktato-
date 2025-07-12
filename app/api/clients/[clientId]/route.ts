// FÁJL 5: app/api/clients/[clientId]/route.ts (JAVÍTVA - await params)
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import Client from '@/lib/models/Client.model';
import mongoose from 'mongoose';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    const { clientId } = await params;
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ message: 'Érvénytelen ügyfél azonosító.' }, { status: 400 });
    }

    await dbConnect();
    const dbSession = await mongoose.startSession();
    let deletedClient;

    await dbSession.withTransaction(async () => {
      await User.deleteMany({ client: clientId }, { session: dbSession });
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