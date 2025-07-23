// app/admin/stats/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, Hourglass, BarChart3, Wrench, Sprout } from "lucide-react"; // Ikonok

export default async function StatsPage() {
  const session = await getServerSession(authOptions);

  // Jogosultság ellenőrzés: csak Super Admin férhet hozzá
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4 text-center">
      <Card className="w-full max-w-3xl shadow-2xl border-4 border-red-500 bg-red-50/20 text-red-800">
        <CardHeader className="flex flex-col items-center space-y-4">
          <Bug className="h-24 w-24 text-red-600 animate-bounce" /> {/* Még nagyobb és mozgó ikon */}
          <CardTitle className="text-5xl font-extrabold text-red-700 tracking-tight leading-tight">
            🚧 Extrém Fejlesztés Alatt! 🚧
          </CardTitle>
          <p className="text-xl font-semibold text-red-800">
            Ez az oldal még a **mély bug-vadászat** fázisában van.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="flex items-center justify-center gap-4 text-lg text-red-900">
            <Hourglass className="h-6 w-6 animate-pulse" />
            <p>
              A statisztikák **valós adatokat** fognak megjeleníteni, de ehhez még sok **kód kell**.
            </p>
          </div>
          <p className="text-lg text-red-800">
            Jelenleg itt csak a fejlesztők fantáziája szab határt... és persze a hiányzó adatbázis lekérdezések. 😅
          </p>
          <div className="flex items-center justify-center space-x-6 pt-4 text-red-700">
            <div className="flex flex-col items-center">
              <BarChart3 className="h-10 w-10 animate-spin-slow" /> {/* Lassan pörgő ikon */}
              <span className="mt-1 text-sm font-medium">Jövőbeli Grafikák</span>
            </div>
            <div className="flex flex-col items-center">
              <Wrench className="h-10 w-10 animate-wrench-wiggle" /> {/* Képzeletbeli animáció */}
              <span className="mt-1 text-sm font-medium">Folyamatos Finomhangolás</span>
            </div>
            <div className="flex flex-col items-center">
              <Sprout className="h-10 w-10 animate-grow" /> {/* Képzeletbeli animáció */}
              <span className="mt-1 text-sm font-medium">Adatpalánták Növesztése</span>
            </div>
          </div>
          <p className="text-base text-red-900/80 mt-6">
            Kérjük, ne használja éles környezetben! A statisztikák jelenleg nem megbízhatók, és akár a rendszer összeomlását is okozhatják (na jó, annyira azért nem). 😉
          </p>
        </CardContent>
      </Card>
    </div>
  );
}