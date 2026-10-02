import path from "node:path";

export const ADMIN_URL = process.env.ADMIN_URL ?? "http://localhost:47311";
export const WALLET_URL = process.env.WALLET_URL ?? "http://localhost:47310";

/**
 * The DB both apps and the tests use. Defaults to the dev DB, which global setup
 * migrates and re-seeds on every run.
 */
export const DB_URL =
  process.env.E2E_DATABASE_URL ??
  `file:${path.resolve(__dirname, "../../packages/db/wallet.db")}`;
