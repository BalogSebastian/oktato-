// Fájl: app/page.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/dbConnect";
import Client from "@/lib/models/Client.model";
import { IClient } from "@/lib/types"; // <-- JAVÍTÁS: Importáljuk a központi típust
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    await dbConnect();
    const role = session.user.role;

    if (role === 'SUPER_ADMIN') {
      redirect('/admin/clients');
    }

    if (role === 'CLIENT_ADMIN') {
      redirect('/dashboard');
    }

    if (role === 'USER') {
      // JAVÍTÁS: Eltávolítottuk a .lean()-t és explicit típust adtunk
      const client: IClient | null = await Client.findById(session.user.client).select('subscribedCourses');
      
      const courseId = client?.subscribedCourses?.[0];

      if (courseId) {
        redirect(`/course/${courseId}`);
      } else {
        return (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold">Hiba</h1>
            <p>Jelenleg nincs hozzárendelt tanfolyamod. Kérjük, vedd fel a kapcsolatot a feletteseddel.</p>
          </div>
        );
      }
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-24 bg-gray-50">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4">Üdv az Oktatási Platformon!</h1>
        <p className="text-xl text-muted-foreground mb-8">A továbblépéshez, kérjük, jelentkezzen be.</p>
        <Button asChild size="lg">
            <Link href="/login">Bejelentkezés</Link>
        </Button>
    </main>
  );
}