import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import dbConnect from "@/lib/dbConnect";
import User from "@/lib/models/User.model";
import * as bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Hiányzó e-mail cím vagy jelszó.");
                }
                await dbConnect();
                
                const user = await User.findOne({ email: credentials.email }).select('+password');
                
                if (!user) {
                    throw new Error("Nincs felhasználó ezzel az e-mail címmel.");
                }
                
                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                
                if (!isPasswordCorrect) {
                    throw new Error("Hibás jelszó.");
                }
                
                // A v4-es authorize callback egy specifikus objektumot vár vissza
                return {
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                    client: user.client,
                };
            },
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            // A 'user' objektum csak az első bejelentkezéskor van jelen
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.client = user.client;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as any; // Castolás szükséges lehet
                session.user.client = token.client as any; // Castolás szükséges lehet
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };