// app/api/payments/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from '@/lib/dbConnect';
import Payment from '@/lib/models/Payment.model';
import Client from '@/lib/models/Client.model';
import User from '@/lib/models/User.model';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Csak Super Admin férhet hozzá
    if (!session || session.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ message: 'Nincs jogosultsága.' }, { status: 403 });
    }

    await dbConnect();

    // Lekérjük az összes fizetést, populáljuk a klienst és a felhasználót
    const payments = await Payment.find({})
      .populate({
        path: 'client',
        model: Client,
        select: 'name' // Csak a kliens neve
      })
      .populate({
        path: 'user',
        model: User,
        select: 'email' // Csak a felhasználó email címe
      })
      .sort({ createdAt: -1 });

    // A populált adatokat megfelelő formátumba alakítjuk a válaszhoz
    const formattedPayments = payments.map(payment => ({
      _id: payment._id.toString(),
      clientName: (payment.client as any)?.name || 'N/A',
      userEmail: (payment.user as any)?.email || 'N/A',
      amount: payment.amount,
      licensesAdded: payment.licensesAdded,
      packageType: payment.packageType,
      status: payment.status,
      transactionId: payment.transactionId || '-',
      createdAt: new Date(payment.createdAt).toLocaleDateString('hu-HU'),
    }));

    return NextResponse.json(formattedPayments);

  } catch (error: any) {
    console.error("API Hiba (Fizetések lekérdezése):", error);
    return NextResponse.json({ message: error.message || 'Szerverhiba történt.' }, { status: 500 });
  }
}