import { createDb, type Db } from "@repo/db";
import { runCustodyProviderConformanceSuite } from "@repo/providers-custody/conformance";
import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { beforeEach } from "vitest";
import { createFireblocksMockWithControls } from "./fireblocks-mock-provider";

async function createCustodySchema(db: Db) {
  const statements = `
    CREATE TABLE fireblocks_vault_accounts (id text PRIMARY KEY NOT NULL, name text NOT NULL, customer_ref_id text, created_at integer NOT NULL);
    CREATE TABLE fireblocks_vault_assets (vault_account_id text NOT NULL, asset_id text NOT NULL, created_at integer NOT NULL, PRIMARY KEY (vault_account_id, asset_id));
    CREATE TABLE fireblocks_balances (vault_account_id text NOT NULL, asset_id text NOT NULL, total text NOT NULL DEFAULT '0', available text NOT NULL DEFAULT '0', pending text NOT NULL DEFAULT '0', updated_at integer NOT NULL, PRIMARY KEY (vault_account_id, asset_id));
    CREATE TABLE fireblocks_deposit_addresses (id text PRIMARY KEY NOT NULL, vault_account_id text NOT NULL, asset_id text NOT NULL, address text NOT NULL, tag text, created_at integer NOT NULL);
    CREATE TABLE fireblocks_transfers (id text PRIMARY KEY NOT NULL, asset_id text NOT NULL, amount text NOT NULL, source_vault_account_id text NOT NULL, destination_type text NOT NULL, destination_vault_account_id text, destination_address text, destination_tag text, direction text NOT NULL, status text NOT NULL, note text, external_tx_id text, idempotency_key text NOT NULL UNIQUE, failure_reason text, confirming_at integer NOT NULL, completion_at integer NOT NULL, intended_outcome text NOT NULL, created_at integer NOT NULL, updated_at integer NOT NULL);
    CREATE TABLE fireblocks_ramp_requests (id text PRIMARY KEY NOT NULL, vault_account_id text NOT NULL, direction text NOT NULL, fiat_currency text NOT NULL, fiat_amount text NOT NULL, asset_id text NOT NULL, asset_amount text NOT NULL, status text NOT NULL, payment_reference text, idempotency_key text NOT NULL UNIQUE, failure_reason text, completion_at integer NOT NULL, intended_outcome text NOT NULL, created_at integer NOT NULL, updated_at integer NOT NULL);
    CREATE TABLE fireblocks_eligibility (vault_account_id text NOT NULL, asset_id text NOT NULL, eligible integer NOT NULL, updated_at integer NOT NULL, PRIMARY KEY (vault_account_id, asset_id));
    CREATE TABLE fireblocks_account_freezes (vault_account_id text NOT NULL, asset_id text NOT NULL, frozen integer NOT NULL, reason text, updated_at integer NOT NULL, PRIMARY KEY (vault_account_id, asset_id));
    CREATE TABLE fireblocks_asset_pauses (asset_id text PRIMARY KEY NOT NULL, paused integer NOT NULL, reason text, updated_at integer NOT NULL);
    CREATE TABLE fireblocks_asset_operations (id text PRIMARY KEY NOT NULL, type text NOT NULL, vault_account_id text NOT NULL, asset_id text NOT NULL, amount text NOT NULL, idempotency_key text NOT NULL UNIQUE, note text, created_at integer NOT NULL);
  `.split(";").map((statement) => statement.trim()).filter(Boolean);
  for (const statement of statements) await db.run(sql.raw(statement));
}

let mock: ReturnType<typeof createFireblocksMockWithControls>;
beforeEach(async () => { const db = createDb(`file:/private/tmp/fireblocks-mock-${randomUUID()}.db`); await createCustodySchema(db); mock = createFireblocksMockWithControls(db, { transferCompletionDelayMs: 60_000, rampCompletionDelayMs: 60_000 }); });
runCustodyProviderConformanceSuite(() => mock.provider, { fund: (vaultId, assetId, amount) => mock.fund(vaultId, assetId, amount), settle: () => mock.settle() });
