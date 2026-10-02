import { createClient, type Client } from "@libsql/client";
import { DB_URL } from "../env";

// Direct DB access for states the UI cannot reach (decision D3 in the plan).
// Column names follow packages/db/drizzle/*.sql.

let client: Client | undefined;

export function getE2eDb() {
  return (client ??= createClient({ url: DB_URL }));
}

/**
 * Makes the user's in-flight custody operation fail. The custody mock settles
 * lazily on read once `completion_at` passes (1-2 s after submit), so call this
 * right after the UI submit. `completion_at` (seconds) is pushed out by 3 s so a
 * concurrent read cannot settle the row before the outcome flips.
 * Returns the number of rows changed.
 */
export async function forceNextCustodyOutcome(
  userId: string,
  kind: "transfer" | "ramp",
  outcome: "FAILED" | "COMPLETED" = "FAILED",
) {
  const vault = "(SELECT id FROM fireblocks_vault_accounts WHERE customer_ref_id = ?)";
  const sql =
    kind === "transfer"
      ? `UPDATE fireblocks_transfers SET intended_outcome = ?, completion_at = completion_at + 3
         WHERE status IN ('SUBMITTED', 'CONFIRMING') AND source_vault_account_id = ${vault}`
      : `UPDATE fireblocks_ramp_requests SET intended_outcome = ?, completion_at = completion_at + 3
         WHERE status = 'PENDING' AND vault_account_id = ${vault}`;
  const res = await getE2eDb().execute({ sql, args: [outcome, userId] });
  return res.rowsAffected;
}

/** Sets the user's USDT projection balance (the amount the wallet UI shows as available). */
export async function setUsdtBalance(userId: string, available: number) {
  await getE2eDb().execute({
    sql: `INSERT INTO balances (user_id, currency_code, available, locked) VALUES (?, 'USDT', ?, 0)
          ON CONFLICT (user_id, currency_code) DO UPDATE SET available = excluded.available`,
    args: [userId, available],
  });
}

/** Gives the user `tokens` of a market token (by symbol), e.g. to reach /assets token actions without trading. */
export async function addHolding(userId: string, symbol: string, tokens: number) {
  await getE2eDb().execute({
    sql: `INSERT INTO holdings (id, user_id, token_id, tokens, locked_tokens, created_at)
          SELECT ?, ?, id, ?, 0, unixepoch() FROM market_tokens WHERE symbol = ?`,
    args: [crypto.randomUUID(), userId, tokens, symbol],
  });
}
