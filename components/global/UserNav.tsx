// Fájl: components/global/UserNav.tsx

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User, KeyRound } from "lucide-react";

export function UserNav() {
  // A useSession hook segítségével lekérjük a kliens oldalon a bejelentkezési adatokat
  const { data: session } = useSession();

  if (!session?.user) {
    // Ha valamiért nincs bejelentkezve a user, nem jelenítünk meg semmit
    return null;
  }

  const userEmail = session.user.email || "";
  const fallback = userEmail.substring(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-auto px-3 flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:inline-block">{userEmail}</span>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">Bejelentkezve mint</p>
            <p className="text-xs leading-none text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Saját adatok</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/change-password">
            <KeyRound className="mr-2 h-4 w-4" />
            <span>Jelszó módosítása</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* A signOut funkciót közvetlenül a next-auth/react-ból hívjuk */}
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Kijelentkezés</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}