import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, KycStatus, sessions, users } from "@repo/db";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { Adapter } from "next-auth/adapters";
import { getDb } from "@/lib/db";

const drizzleAdapter = DrizzleAdapter(getDb(), {
  usersTable: users,
  accountsTable: accounts,
  sessionsTable: sessions,
});

const adapter: Adapter = {
  ...drizzleAdapter,
  async createUser(data) {
    const createUser = drizzleAdapter.createUser;
    if (!createUser) {
      throw new Error("Auth adapter does not support creating users");
    }
    return createUser({
      ...data,
      name: data.name ?? data.email?.split("@")[0] ?? "Usuario",
    });
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  providers: [Google],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  trustHost: true,
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
      }

      if (token.id && (user || trigger === "update")) {
        const [dbUser] = await getDb()
          .select({ kycStatus: users.kycStatus })
          .from(users)
          .where(eq(users.id, token.id as string));
        token.kycStatus = dbUser?.kycStatus ?? "none";
      }

      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.kycStatus = (token.kycStatus ?? "none") as KycStatus;
      }
      return session;
    },
  },
});
