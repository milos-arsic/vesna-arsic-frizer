import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db, getDb } from "@/lib/db";
import {
  accounts,
  sessions,
  users,
  verificationTokens,
} from "@/lib/db/schema";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function resolveRole(email: string | null | undefined, role?: string | null) {
  if (email && getAdminEmails().includes(email.toLowerCase())) {
    return "admin" as const;
  }
  return role === "admin" ? "admin" : ("customer" as const);
}

const adapter = process.env.DATABASE_URL
  ? DrizzleAdapter(getDb(), {
      usersTable: users,
      accountsTable: accounts,
      sessionsTable: sessions,
      verificationTokensTable: verificationTokens,
    })
  : undefined;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.events",
          ].join(" "),
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session: sessionUpdate }) {
      if (user) {
        token.id = user.id;
        token.name = user.name ?? token.name;
        token.role = resolveRole(user.email, (user as { role?: string }).role);
        token.phone = (user as { phone?: string | null }).phone ?? null;
      }

      if (trigger === "update") {
        const updateData = sessionUpdate as
          | { phone?: string | null; name?: string | null }
          | undefined;

        if (updateData?.phone !== undefined) {
          token.phone = updateData.phone;
        }
        if (updateData?.name !== undefined) {
          token.name = updateData.name;
        }

        if (token.id) {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.id, token.id as string),
          });
          if (dbUser) {
            token.name = dbUser.name ?? token.name;
            token.role = resolveRole(dbUser.email, dbUser.role);
            token.phone = dbUser.phone ?? token.phone ?? null;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | null | undefined) ?? session.user.name;
        session.user.role = (token.role as "customer" | "admin") ?? "customer";
        session.user.phone = (token.phone as string | null) ?? null;
      }
      return session;
    },
  },
  events: {
    async createUser({ user }) {
      if (!user.email || !user.id) return;

      if (getAdminEmails().includes(user.email.toLowerCase())) {
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, user.id));
      }
    },
    async signIn({ user }) {
      if (!user.email || !user.id) return;

      if (getAdminEmails().includes(user.email.toLowerCase())) {
        await db
          .update(users)
          .set({ role: "admin" })
          .where(eq(users.id, user.id));
      }
    },
  },
});

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

export async function getAdminUsers() {
  return db.query.users.findMany({
    where: eq(users.role, "admin"),
  });
}
