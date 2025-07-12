// Fájl: app/login/page.tsx

import { LoginForm } from "@/components/forms/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Bejelentkezés</CardTitle>
        <CardDescription>
          Adja meg e-mail címét és jelszavát a belépéshez.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}