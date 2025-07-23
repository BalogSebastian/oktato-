// app/api/clients/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Client from '@/lib/models/Client.model';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    await dbConnect();
    const clients = await Client.find({}).select('name').lean(); // Csak a nevet kérjük le
    
    return NextResponse.json(clients);
  } catch (error: any) {
    console.error("API Hiba (Ügyfelek lekérdezése):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}