import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserRole } from "../models/User.model";
import { Schema } from "mongoose";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      client?: Schema.Types.ObjectId;
    } & DefaultSession["user"];
  }

  // A v4-ben a User objektum egyszerűbb
  interface User {
      id: string;
      role: UserRole;
      client?: Schema.Types.ObjectId;
  }
}

declare module "next-auth/jwt" {
  // A token mezői legyenek opcionálisak
  interface JWT {
    id?: string;
    role?: UserRole;
    client?: Schema.Types.ObjectId;
  }
}