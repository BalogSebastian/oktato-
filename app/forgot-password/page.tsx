// Fájl: app/forgot-password/page.tsx

import { ForgotPasswordForm } from "@/components/forms/ForgotPasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Elfelejtett jelszó</CardTitle>
          <CardDescription>
            Adja meg a fiókjához tartozó e-mail címet. Küldünk egy linket, amivel újat állíthat be.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
          <div className="mt-4 text-center text-sm">
            <Link href="/login" className="underline">
              Vissza a bejelentkezéshez
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}