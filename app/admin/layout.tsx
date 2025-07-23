// FÁJL 4: app/admin/layout.tsx (JAVÍTVA - teljes navigáció)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Home,
  Users,
  CreditCard,
  Package2,
  BookOpen,
  BarChart3,
  Settings,
  Mail,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserNav } from "@/components/global/UserNav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'SUPER_ADMIN') {
    redirect('/login');
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Oktatási Platform</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
              <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/admin/clients" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <Users className="h-4 w-4" />
                Ügyfelek
              </Link>
              <Link href="/admin/licenses" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <CreditCard className="h-4 w-4" />
                Licenszek
              </Link>
              <Link href="/admin/users" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <Users className="h-4 w-4" />
                Felhasználók
              </Link>
              <Link href="/admin/courses" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <BookOpen className="h-4 w-4" />
                Kurzusok
              </Link>
              <Link href="/admin/payments" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <CreditCard className="h-4 w-4" />
                Fizetések
              </Link>
              <Link href="/admin/stats" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <BarChart3 className="h-4 w-4" />
                Statisztikák
              </Link>
              <Link href="/admin/emails" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <Mail className="h-4 w-4" />
                Email logok
              </Link>
              <Link href="/admin/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-muted transition-all">
                <Settings className="h-4 w-4" />
                Beállítások
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Keresés..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100/40 dark:bg-gray-800/40">
          {children}
        </main>
      </div>
    </div>
  );
}
