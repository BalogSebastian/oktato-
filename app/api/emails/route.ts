// app/api/emails/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Csak Super Admin férhet hozzá
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    // --- SZIMULÁLT E-MAIL LOGOK ---
    // Valós alkalmazásban itt SendGrid API-t hívnál, vagy adatbázisból olvasnál ki logokat
    const mockEmailLogs = [
      {
        id: 'log_001',
        to: 'client_admin@ceg1.hu',
        from: 'noreply@platform.hu',
        subject: 'Sikeres regisztráció az Oktatási Platformon!',
        status: 'Küldve',
        type: 'Üdvözlő',
        timestamp: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 órával ezelőtt
      },
      {
        id: 'log_002',
        to: 'user1@ceg1.hu',
        from: 'noreply@platform.hu',
        subject: 'Meghívó a(z) Ceg 1 oktatási felületére',
        status: 'Küldve',
        type: 'Meghívó',
        timestamp: new Date(Date.now() - 7200 * 1000).toISOString(), // 2 órával ezelőtt
      },
      {
        id: 'log_003',
        to: 'super_admin@platform.hu',
        from: 'noreply@platform.hu',
        subject: 'Jelszó visszaállítása az Oktatási Platformon',
        status: 'Sikertelen', // Példa sikertelen logra
        type: 'Jelszó visszaállítás',
        timestamp: new Date(Date.now() - 10800 * 1000).toISOString(), // 3 órával ezelőtt
      },
      {
        id: 'log_004',
        to: 'user2@ceg2.hu',
        from: 'noreply@platform.hu',
        subject: 'Meghívó a(z) Ceg 2 oktatási felületére',
        status: 'Küldve',
        type: 'Meghívó',
        timestamp: new Date(Date.now() - 14400 * 1000).toISOString(), // 4 órával ezelőtt
      },
    ];

    return NextResponse.json(mockEmailLogs);

  } catch (error: any) {
    console.error("API Hiba (E-mail logok lekérdezése):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}