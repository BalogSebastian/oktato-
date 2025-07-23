// app/admin/courses/page.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, TriangleAlert } from "lucide-react"; // Ikonok

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  // Jogosultság ellenőrzés: csak Super Admin férhet hozzá
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] p-4">
      <Card className="w-full max-w-2xl text-center shadow-lg border-yellow-500/50">
        <CardHeader className="flex flex-col items-center space-y-4">
          <TriangleAlert className="h-20 w-20 text-yellow-500 animate-pulse" />
          <CardTitle className="text-4xl font-bold text-yellow-600">
            Fejlesztés Alatt
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-muted-foreground">
            A **Kurzusok oldal** jelenleg fejlesztés alatt áll.
          </p>
          <p className="text-md text-muted-foreground">
            Kérjük, térjen vissza később, vagy lépjen kapcsolatba a rendszergazdával további információért.
          </p>
          <div className="flex items-center justify-center text-muted-foreground pt-4">
            <Wrench className="h-5 w-5 mr-2" />
            <span>Folyamatban lévő munkák...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}