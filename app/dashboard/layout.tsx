// Fájl: app/dashboard/layout.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Home, Users, BookUser } from "lucide-react";
import Client from "@/lib/models/Client.model";
import { IClient } from "@/lib/types";
import dbConnect from "@/lib/dbConnect";
import { UserNav } from "@/components/global/UserNav"; // <-- ÚJ IMPORT

export default async function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== 'CLIENT_ADMIN') {
    redirect('/login');
  }

  await dbConnect();
  const client: IClient | null = await Client.findById(session.user.client).select('name');
  const clientName = client?.name || "Ügyfél";

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <BookUser className="h-6 w-6 text-primary" />
              <span className="">{clientName}</span>
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Vezérlőpult
              </Link>
              <Link
                href="/dashboard/employees"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Users className="h-4 w-4" />
                Munkavállalók
              </Link>
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            <h1 className="text-lg font-semibold">{clientName} Vezérlőpult</h1>
          </div>
          {/* JAVÍTÁS: Itt is az új, központi menüt használjuk */}
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-gray-100/40 dark:bg-gray-800/40">
          {children}
        </main>
      </div>
    </div>
  );
}