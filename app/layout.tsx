// Fájl: app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AuthProvider from "@/components/providers/AuthProvider";
import { seedSuperAdmin } from "@/lib/seed"; // <-- IMPORTÁLÁS

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oktatási Platform",
  description: "Tűz, Munkavédelem, HACCP",
};

// A RootLayout most már 'async', hogy használhassuk benne az 'await'-et
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // A Super Admin létrehozó/ellenőrző funkció meghívása
  await seedSuperAdmin();

  return (
    <html lang="hu">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}