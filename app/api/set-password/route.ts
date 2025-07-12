// Fájl: app/api/set-password/route.ts

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/lib/models/User.model';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import * as z from 'zod';

const formSchema = z.object({
  password: z.string().min(8),
  token: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    const validation = formSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Érvénytelen adatok.' }, { status: 400 });
    }
    const { password, token } = validation.data;

    // 1. Keressük meg a felhasználót a hashelt token alapján
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: 'A link érvénytelen vagy lejárt.' }, { status: 400 });
    }

    // 2. Mentsük el az új, hashelt jelszót
    user.password = await bcrypt.hash(password, 10);

    // 3. Töröljük a tokeneket, hogy a link ne legyen újra felhasználható
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return NextResponse.json({ message: 'Jelszó sikeresen frissítve.' }, { status: 200 });

  } catch (error) {
    console.error("API Hiba (Jelszó beállítása):", error);
    return NextResponse.json({ message: 'Szerverhiba történt.' }, { status: 500 });
  }
}