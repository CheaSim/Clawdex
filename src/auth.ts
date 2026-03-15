import bcrypt from "bcryptjs";
import { getServerSession, type NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  // Credentials provider does NOT support database sessions in next-auth v4.
  // We must use JWT strategy; the session callback still enriches from DB.
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Clawdex Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = typeof credentials?.email === "string" ? credentials.email.trim().toLowerCase() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { player: true },
        });

        if (!user?.passwordHash || user.status !== "ACTIVE") {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          return null;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, persist user id and email into the JWT
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      const email = token.email as string | undefined;

      if (!email) {
        return session;
      }

      const user = await prisma.user.findUnique({
        where: { email },
        include: { player: true },
      });

      if (!user) {
        return session;
      }

      session.user.id = user.id;
      session.user.role = user.role;
      session.user.status = user.status;
      session.user.playerId = user.playerId ?? null;
      session.user.playerSlug = user.player?.slug ?? null;

      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
