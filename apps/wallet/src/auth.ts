import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { accounts, KycStatus, sessions, users } from "@repo/db";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import type { Adapter } from "next-auth/adapters";
import { getDb } from "@/lib/db";

if (!process.env.AUTH_SECRET) {
  console.warn("[wallet] AUTH_SECRET is not set; sessions will fail (start the dev server from apps/wallet so .env.local is loaded)");
}

// Test-only login for Playwright (apps/e2e). Never enabled in production.
const e2eBypass =
  process.env.E2E_AUTH_BYPASS === "1" && process.env.NODE_ENV !== "production";
if (e2eBypass) {
  console.warn("[wallet] E2E_AUTH_BYPASS is active: credentials login enabled for demo-user and e2e-* users");
}
const E2E_USER_ID = /^e2e-[a-z0-9-]{1,64}$/;

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
  secret: process.env.AUTH_SECRET,
  providers: e2eBypass
    ? [
        Google,
        Credentials({
          id: "e2e",
          credentials: { userId: {} },
          // demo-user by default; "e2e-*" ids are created on demand so each test can use a fresh user.
          async authorize(credentials) {
            const requested = credentials?.userId;
            const id = typeof requested === "string" && requested ? requested : "demo-user";
            if (id !== "demo-user" && !E2E_USER_ID.test(id)) return null;

            const db = getDb();
            if (id !== "demo-user") {
              await db
                .insert(users)
                .values({ id, name: `E2E ${id.slice(4, 12)}`, email: `${id}@e2e.local` })
                .onConflictDoNothing();
            }
            const [user] = await db
              .select({ id: users.id, name: users.name, email: users.email })
              .from(users)
              .where(eq(users.id, id));
            return user ?? null;
          },
        }),
      ]
    : [Google],
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
