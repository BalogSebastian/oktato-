// app/api/clients/[clientId]/update-licenses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Client from '@/lib/models/Client.model';
import mongoose from 'mongoose';
import * as z from 'zod';

const updateLicensesSchema = z.object({
  additionalLicenses: z.number().int().min(1, { message: "Legalább 1 licenszt kell hozzáadni." }),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ clientId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    const { clientId } = await context.params;
    
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return NextResponse.json({ message: 'Érvénytelen ügyfél azonosító.' }, { status: 400 });
    }

    const body = await request.json();
    const validation = updateLicensesSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { additionalLicenses } = validation.data;

    await dbConnect();

    const client = await Client.findById(clientId);
    if (!client) {
      return NextResponse.json({ message: 'Ügyfél nem található.' }, { status: 404 });
    }

    client.licenseCount += additionalLicenses;
    await client.save();

    return NextResponse.json({ 
      message: 'Licenszek sikeresen hozzáadva.', 
      newLicenseCount: client.licenseCount 
    });
  } catch (error: any) {
    console.error("API Hiba (Licensz frissítése):", error);
    return NextResponse.json({ 
      message: error.message || 'Szerverhiba történt.' 
    }, { status: 500 });
  }
}