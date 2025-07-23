// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Setting from '@/lib/models/Setting.model';
import * as z from 'zod';

// Zod séma a beállítások frissítéséhez
const settingUpdateSchema = z.object({
  key: z.string(),
  value: z.any(), // A value lehet bármilyen típus, amit a frontend küld
  type: z.enum(['string', 'number', 'boolean', 'json']).optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    await dbConnect();
    const settings = await Setting.find({});
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("API Hiba (Beállítások lekérdezése):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = settingUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: validation.error.errors[0].message }, { status: 400 });
    }

    const { key, value, type } = validation.data;

    await dbConnect();

    // Típuskonverzió a mentés előtt, ha szükséges (pl. string 'true' -> boolean true)
    let finalValue = value;
    if (type === 'number') {
      finalValue = Number(value);
      if (isNaN(finalValue)) {
        return NextResponse.json({ message: `Érvénytelen szám formátum a(z) ${key} beállításnál.` }, { status: 400 });
      }
    } else if (type === 'boolean') {
      finalValue = (value === 'true' || value === true);
    } else if (type === 'json') {
      try {
        finalValue = JSON.parse(value);
      } catch (e) {
        return NextResponse.json({ message: `Érvénytelen JSON formátum a(z) ${key} beállításnál.` }, { status: 400 });
      }
    }

    const updatedSetting = await Setting.findOneAndUpdate(
      { key: key },
      { value: finalValue, updatedAt: new Date() },
      { new: true, upsert: true } // Létrehozza, ha nem létezik
    );

    return NextResponse.json({ message: 'Beállítás sikeresen frissítve.', setting: updatedSetting });

  } catch (error: any) {
    console.error("API Hiba (Beállítás frissítése):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}