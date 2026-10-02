import { request } from "@playwright/test";
import { execSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { ADMIN_URL, DB_URL, WALLET_URL } from "./env";
import { loginAs } from "./helpers/auth";

const REPO_ROOT = path.resolve(__dirname, "../..");

/** Migrates and re-seeds the DB (unless E2E_SKIP_SEED=1). */
function resetDb() {
  if (process.env.E2E_SKIP_SEED === "1") return;
  const opts = {
    cwd: REPO_ROOT,
    stdio: "inherit" as const,
    env: { ...process.env, DATABASE_URL: DB_URL },
  };
  execSync("pnpm --filter @repo/db db:migrate", opts);
  execSync("pnpm --filter @repo/db db:seed", opts);
}

/** Fails early when the admin server reads a different (e.g. empty) DB. */
async function checkAdminDb() {
  const ctx = await request.newContext({ baseURL: ADMIN_URL });
  try {
    const res = await ctx.get(
      `/api/trpc/admin.dashboard.stats?input=${encodeURIComponent("{}")}`,
    );
    const body = (await res.json().catch(() => null)) as {
      result?: { data?: { totalProperties?: number } };
    } | null;
    if (!res.ok() || !body?.result?.data?.totalProperties) {
      throw new Error(
        `Admin at ${ADMIN_URL} does not see the seeded DB (admin.dashboard.stats -> ${res.status()}). ` +
          `Restart it with DATABASE_URL=${DB_URL}, or add apps/admin/.env.local with ` +
          "DATABASE_URL=file:../../packages/db/wallet.db.",
      );
    }
  } finally {
    await ctx.dispose();
  }
}

/** Resets the DB, checks the admin, and saves a demo-user session to .auth/wallet.json. */
export default async function globalSetup() {
  resetDb();
  await checkAdminDb();

  const ctx = await request.newContext({ baseURL: WALLET_URL });
  try {
    await loginAs(ctx, "demo-user");
    mkdirSync(".auth", { recursive: true });
    await ctx.storageState({ path: ".auth/wallet.json" });
  } finally {
    await ctx.dispose();
  }
}
