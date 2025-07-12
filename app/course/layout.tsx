// Fájl: app/course/layout.tsx

import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpenCheck } from "lucide-react";
import { UserNav } from "@/components/global/UserNav"; // <-- Itt használjuk az új menüt

export default async function CourseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Levédjük az oldalt, csak bejelentkezett felhasználók láthatják
  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* EGYSZERŰ FEJLÉC A TANULÁSI FELÜLETHEZ */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/" // A főoldalra irányít, ami majd eldönti, hova tovább
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <BookOpenCheck className="h-6 w-6 text-primary" />
            <span className="sr-only">Oktatási Platform</span>
          </Link>
        </nav>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <div className="ml-auto flex-1 sm:flex-initial" />
          {/* Itt használjuk az új, központi menüt */}
          <UserNav />
        </div>
      </header>
      <main className="flex flex-1 items-start justify-center p-4 sm:px-6 sm:py-0 md:gap-8 bg-muted/40">
         {children}
      </main>
    </div>
  );
}