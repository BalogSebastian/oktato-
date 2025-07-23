// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Schema } from "mongoose"; // Fontos, hogy ez is importálva legyen, ha Schema.Types.ObjectId-ot használsz

export type UserRole = 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'USER';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      client?: Schema.Types.ObjectId; // Maradjon ez a típus az ID-hoz
    } & DefaultSession["user"];
    // FONTOS: Add hozzá ezt a sort!
    accessToken?: string; 
  }

  // NextAuth User interfész bővítése, ha szükséges (általában a DB User modellhez igazodik)
  interface User {
    id: string; // A felhasználó DB ID-ja
    role: UserRole;
    client?: Schema.Types.ObjectId; // A kliens ID-ja
    email: string; // Hozzáadva a teljeség kedvéért
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    client?: Schema.Types.ObjectId; // A kliens ID-ja
    // FONTOS: Add hozzá ezt a sort!
    accessToken?: string; 
  }
}