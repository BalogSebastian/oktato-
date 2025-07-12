import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { Schema } from "mongoose";

export type UserRole = 'SUPER_ADMIN' | 'CLIENT_ADMIN' | 'USER';

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      client?: Schema.Types.ObjectId;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    client?: Schema.Types.ObjectId;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    client?: Schema.Types.ObjectId;
  }
}