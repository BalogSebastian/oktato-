// Fájl: app/set-password/[token]/page.tsx

import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User.model";
import crypto from 'crypto';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/forms/SetPasswordForm";

interface SetPasswordPageProps {
  params: {
    token: string;
  };
}

// Token validálása a szerver oldalon
async function validateToken(token: string) {
  await dbConnect();

  // A token hashelt verzióját keressük az adatbázisban
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }, // Ellenőrizzük, hogy nem járt-e le
  });

  if (!user) {
    return { isValid: false, error: "Ez a link érvénytelen vagy lejárt. Kérjen újat." };
  }

  return { isValid: true, error: null };
}

export default async function SetPasswordPage({ params }: SetPasswordPageProps) {
  const { token } = params;
  const { isValid, error } = await validateToken(token);

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Jelszó Beállítása</CardTitle>
          <CardDescription>
            {isValid ? "Adja meg új jelszavát a fiók aktiválásához." : "Hiba"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isValid ? (
            <SetPasswordForm token={token} />
          ) : (
            <p className="text-center text-red-600">{error}</p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}