// FÁJL 4: app/set-password/[token]/page.tsx (JAVÍTVA - await params)
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User.model";
import crypto from 'crypto';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SetPasswordForm } from "@/components/forms/SetPasswordForm";

interface SetPasswordPageProps {
  params: Promise<{
    token: string;
  }>;
}

async function validateToken(token: string) {
  await dbConnect();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return { isValid: false, error: "Ez a link érvénytelen vagy lejárt. Kérjen újat." };
  }
  return { isValid: true, error: null };
}

export default async function SetPasswordPage({ params }: SetPasswordPageProps) {
  const { token } = await params;
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