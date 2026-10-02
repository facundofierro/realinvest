import { randomUUID } from "node:crypto";
import { fireblocksAccountFreezes, fireblocksAssetOperations, fireblocksAssetPauses, fireblocksBalances, fireblocksDepositAddresses, fireblocksEligibility, fireblocksRampRequests, fireblocksTransfers, fireblocksVaultAccounts, fireblocksVaultAssets, type Db } from "@repo/db";
import { AccountFrozenError, AssetNotEnabledError, AssetPausedError, InsufficientBalanceError, NotEligibleError, VaultAccountNotFoundError, type CustodyProvider, type AccountFreezeState, type Balance, type DepositAddress, type EligibilityState, type MintBurnInput, type MintBurnResult, type RampRequest, type Transfer, type VaultAccount } from "@repo/providers-custody";
import { and, eq, or } from "drizzle-orm";
import { addDecimal, compareDecimal, subtractDecimal } from "./math";

export interface FireblocksMockOptions {
  now?: () => Date;
  transferConfirmingDelayMs?: number;
  transferCompletionDelayMs?: number;
  rampCompletionDelayMs?: number;
  defaultTransferOutcome?: "COMPLETED" | "FAILED";
  defaultRampOutcome?: "COMPLETED" | "FAILED";
  transferOutcomes?: Record<string, "COMPLETED" | "FAILED">;
  rampOutcomes?: Record<string, "COMPLETED" | "FAILED">;
}
export interface FireblocksMock { provider: CustodyProvider; fund(vaultAccountId: string, assetId: string, amount: string): Promise<void>; settle(): Promise<void>; }

const stamp = (date: Date) => date.toISOString();
const DEFAULT_CONFIRMING_MS = 1_000;
const DEFAULT_COMPLETION_MS = 2_000;
const DEFAULT_RAMP_MS = 2_000;

export function createFireblocksMock(db: Db, options: FireblocksMockOptions = {}): CustodyProvider { return createFireblocksMockWithControls(db, options).provider; }

export function createFireblocksMockWithControls(db: Db, options: FireblocksMockOptions = {}): FireblocksMock {
  const clock = options.now ?? (() => new Date());
  // SQLite timestamp columns store whole seconds; normalize API values accordingly.
  const now = () => { const value = new Date(clock()); value.setMilliseconds(0); return value; };
  const confirmingDelay = options.transferConfirmingDelayMs ?? DEFAULT_CONFIRMING_MS;
  const completionDelay = options.transferCompletionDelayMs ?? DEFAULT_COMPLETION_MS;
  const rampDelay = options.rampCompletionDelayMs ?? DEFAULT_RAMP_MS;

  const vault = (row: typeof fireblocksVaultAccounts.$inferSelect): VaultAccount => ({ id: row.id, name: row.name, customerRefId: row.customerRefId, createdAt: stamp(row.createdAt) });
  const balance = (row: typeof fireblocksBalances.$inferSelect): Balance => ({ vaultAccountId: row.vaultAccountId, assetId: row.assetId, total: row.total, available: row.available, pending: row.pending });
  const address = (row: typeof fireblocksDepositAddresses.$inferSelect): DepositAddress => ({ id: row.id, vaultAccountId: row.vaultAccountId, assetId: row.assetId, address: row.address, tag: row.tag, createdAt: stamp(row.createdAt) });
  const transfer = (row: typeof fireblocksTransfers.$inferSelect): Transfer => ({ id: row.id, assetId: row.assetId, amount: row.amount, sourceVaultAccountId: row.sourceVaultAccountId, destination: row.destinationType === "VAULT_ACCOUNT" ? { type: "VAULT_ACCOUNT", vaultAccountId: row.destinationVaultAccountId! } : { type: "ONE_TIME_ADDRESS", address: row.destinationAddress!, tag: row.destinationTag }, direction: row.direction as Transfer["direction"], status: row.status as Transfer["status"], note: row.note, externalTxId: row.externalTxId, idempotencyKey: row.idempotencyKey, failureReason: row.failureReason, createdAt: stamp(row.createdAt), updatedAt: stamp(row.updatedAt) });
  const ramp = (row: typeof fireblocksRampRequests.$inferSelect): RampRequest => ({ id: row.id, vaultAccountId: row.vaultAccountId, direction: row.direction as RampRequest["direction"], fiatCurrency: row.fiatCurrency, fiatAmount: row.fiatAmount, assetId: row.assetId, assetAmount: row.assetAmount, status: row.status as RampRequest["status"], paymentReference: row.paymentReference, idempotencyKey: row.idempotencyKey, failureReason: row.failureReason, createdAt: stamp(row.createdAt), updatedAt: stamp(row.updatedAt) });

  async function requireVault(id: string) { const [row] = await db.select().from(fireblocksVaultAccounts).where(eq(fireblocksVaultAccounts.id, id)); if (!row) throw new VaultAccountNotFoundError(id); return row; }
  async function requireBalance(vaultAccountId: string, assetId: string) { await requireVault(vaultAccountId); const [row] = await db.select().from(fireblocksBalances).where(and(eq(fireblocksBalances.vaultAccountId, vaultAccountId), eq(fireblocksBalances.assetId, assetId))); if (!row) throw new AssetNotEnabledError(vaultAccountId, assetId); return row; }
  async function requireActive(vaultAccountId: string, assetId: string) {
    const [pause] = await db.select().from(fireblocksAssetPauses).where(eq(fireblocksAssetPauses.assetId, assetId)); if (pause?.paused) throw new AssetPausedError(assetId);
    const [freeze] = await db.select().from(fireblocksAccountFreezes).where(and(eq(fireblocksAccountFreezes.vaultAccountId, vaultAccountId), eq(fireblocksAccountFreezes.assetId, assetId))); if (freeze?.frozen) throw new AccountFrozenError(vaultAccountId, assetId);
    const [eligibility] = await db.select().from(fireblocksEligibility).where(and(eq(fireblocksEligibility.vaultAccountId, vaultAccountId), eq(fireblocksEligibility.assetId, assetId))); if (!eligibility?.eligible) throw new NotEligibleError(vaultAccountId, assetId);
  }
  async function changeBalance(vaultAccountId: string, assetId: string, amount: string, operation: "add" | "sub") {
    const current = await requireBalance(vaultAccountId, assetId); const updatedAt = now();
    await db.update(fireblocksBalances).set({ total: operation === "add" ? addDecimal(current.total, amount) : subtractDecimal(current.total, amount), available: operation === "add" ? addDecimal(current.available, amount) : subtractDecimal(current.available, amount), updatedAt }).where(and(eq(fireblocksBalances.vaultAccountId, vaultAccountId), eq(fireblocksBalances.assetId, assetId)));
  }
  async function resolveDue() {
    const current = now();
    const transfers = await db.select().from(fireblocksTransfers).where(or(eq(fireblocksTransfers.status, "SUBMITTED"), eq(fireblocksTransfers.status, "CONFIRMING")));
    for (const row of transfers) {
      if (current >= row.completionAt) {
        const completed = row.intendedOutcome === "COMPLETED";
        if (completed) { await changeBalance(row.sourceVaultAccountId, row.assetId, row.amount, "sub"); if (row.destinationType === "VAULT_ACCOUNT") await changeBalance(row.destinationVaultAccountId!, row.assetId, row.amount, "add"); }
        await db.update(fireblocksTransfers).set({ status: completed ? "COMPLETED" : "FAILED", failureReason: completed ? null : "Forced mock failure", updatedAt: current }).where(eq(fireblocksTransfers.id, row.id));
      } else if (current >= row.confirmingAt && row.status === "SUBMITTED") await db.update(fireblocksTransfers).set({ status: "CONFIRMING", updatedAt: current }).where(eq(fireblocksTransfers.id, row.id));
    }
    const ramps = await db.select().from(fireblocksRampRequests).where(eq(fireblocksRampRequests.status, "PENDING"));
    for (const row of ramps) if (current >= row.completionAt) {
      const completed = row.intendedOutcome === "COMPLETED";
      if (completed) await changeBalance(row.vaultAccountId, row.assetId, row.assetAmount, row.direction === "ON_RAMP" ? "add" : "sub");
      await db.update(fireblocksRampRequests).set({ status: completed ? "COMPLETED" : "FAILED", failureReason: completed ? null : "Forced mock failure", updatedAt: current }).where(eq(fireblocksRampRequests.id, row.id));
    }
  }
  async function settle() { const instant = now(); await db.update(fireblocksTransfers).set({ completionAt: instant }).where(or(eq(fireblocksTransfers.status, "SUBMITTED"), eq(fireblocksTransfers.status, "CONFIRMING"))); await db.update(fireblocksRampRequests).set({ completionAt: instant }).where(eq(fireblocksRampRequests.status, "PENDING")); await resolveDue(); }
  async function state(vaultAccountId: string, assetId: string, eligible: boolean, frozen: boolean, reason: string | null) {
    const updatedAt = now(); await requireBalance(vaultAccountId, assetId);
    await db.insert(fireblocksEligibility).values({ vaultAccountId, assetId, eligible, updatedAt }).onConflictDoUpdate({ target: [fireblocksEligibility.vaultAccountId, fireblocksEligibility.assetId], set: { eligible, updatedAt } });
    await db.insert(fireblocksAccountFreezes).values({ vaultAccountId, assetId, frozen, reason, updatedAt }).onConflictDoUpdate({ target: [fireblocksAccountFreezes.vaultAccountId, fireblocksAccountFreezes.assetId], set: { frozen, reason, updatedAt } });
  }

  const provider: CustodyProvider = {
    async createVaultAccount(input) { await resolveDue(); const createdAt = now(); const row = { id: randomUUID(), name: input.name, customerRefId: input.customerRefId ?? null, createdAt }; await db.insert(fireblocksVaultAccounts).values(row); return vault(row); },
    async getVaultAccount(id) { await resolveDue(); const [row] = await db.select().from(fireblocksVaultAccounts).where(eq(fireblocksVaultAccounts.id, id)); return row ? vault(row) : null; },
    async listVaultAccounts() { await resolveDue(); return (await db.select().from(fireblocksVaultAccounts)).map(vault); },
    async enableAsset(vaultAccountId, assetId) { await resolveDue(); await requireVault(vaultAccountId); const createdAt = now(); await db.insert(fireblocksVaultAssets).values({ vaultAccountId, assetId, createdAt }).onConflictDoNothing(); await db.insert(fireblocksBalances).values({ vaultAccountId, assetId, updatedAt: createdAt }).onConflictDoNothing(); await state(vaultAccountId, assetId, true, false, null); },
    async listEnabledAssets(vaultAccountId) { await resolveDue(); await requireVault(vaultAccountId); return (await db.select().from(fireblocksVaultAssets).where(eq(fireblocksVaultAssets.vaultAccountId, vaultAccountId))).map((item) => item.assetId); },
    async getBalance(vaultAccountId, assetId) { await resolveDue(); return balance(await requireBalance(vaultAccountId, assetId)); },
    async listBalances(vaultAccountId) { await resolveDue(); await requireVault(vaultAccountId); return (await db.select().from(fireblocksBalances).where(eq(fireblocksBalances.vaultAccountId, vaultAccountId))).map(balance); },
    async createDepositAddress(vaultAccountId, assetId) { await resolveDue(); await requireBalance(vaultAccountId, assetId); const createdAt = now(); const row = { id: randomUUID(), vaultAccountId, assetId, address: `deposit_${randomUUID().replaceAll("-", "")}`, tag: null, createdAt }; await db.insert(fireblocksDepositAddresses).values(row); return address(row); },
    async listDepositAddresses(vaultAccountId, assetId) { await resolveDue(); await requireBalance(vaultAccountId, assetId); return (await db.select().from(fireblocksDepositAddresses).where(and(eq(fireblocksDepositAddresses.vaultAccountId, vaultAccountId), eq(fireblocksDepositAddresses.assetId, assetId)))).map(address); },
    async createTransfer(input) { await resolveDue(); const [existing] = await db.select().from(fireblocksTransfers).where(eq(fireblocksTransfers.idempotencyKey, input.idempotencyKey)); if (existing) return transfer(existing); const source = await requireBalance(input.sourceVaultAccountId, input.assetId); await requireActive(input.sourceVaultAccountId, input.assetId); if (input.destination.type === "VAULT_ACCOUNT") { await requireBalance(input.destination.vaultAccountId, input.assetId); await requireActive(input.destination.vaultAccountId, input.assetId); } if (compareDecimal(input.amount, "0") <= 0) throw new Error("Transfer amount must be positive"); if (compareDecimal(input.amount, source.available) > 0) throw new InsufficientBalanceError(input.sourceVaultAccountId, input.assetId, input.amount, source.available); const createdAt = now(); const outcome = options.transferOutcomes?.[input.idempotencyKey] ?? options.defaultTransferOutcome ?? "COMPLETED"; const row = { id: randomUUID(), assetId: input.assetId, amount: input.amount, sourceVaultAccountId: input.sourceVaultAccountId, destinationType: input.destination.type, destinationVaultAccountId: input.destination.type === "VAULT_ACCOUNT" ? input.destination.vaultAccountId : null, destinationAddress: input.destination.type === "ONE_TIME_ADDRESS" ? input.destination.address : null, destinationTag: input.destination.type === "ONE_TIME_ADDRESS" ? input.destination.tag ?? null : null, direction: input.destination.type === "VAULT_ACCOUNT" ? "internal" : "external", status: "SUBMITTED", note: input.note ?? null, externalTxId: input.externalTxId ?? null, idempotencyKey: input.idempotencyKey, failureReason: null, confirmingAt: new Date(createdAt.getTime() + confirmingDelay), completionAt: new Date(createdAt.getTime() + completionDelay), intendedOutcome: outcome, createdAt, updatedAt: createdAt }; await db.insert(fireblocksTransfers).values(row); return transfer(row); },
    async getTransfer(id) { await resolveDue(); const [row] = await db.select().from(fireblocksTransfers).where(eq(fireblocksTransfers.id, id)); return row ? transfer(row) : null; },
    async listTransfers(filter) { await resolveDue(); const rows = await db.select().from(fireblocksTransfers); return rows.filter((item) => !filter?.vaultAccountId || item.sourceVaultAccountId === filter.vaultAccountId || item.destinationVaultAccountId === filter.vaultAccountId).map(transfer); },
    async createRampRequest(input) { await resolveDue(); const [existing] = await db.select().from(fireblocksRampRequests).where(eq(fireblocksRampRequests.idempotencyKey, input.idempotencyKey)); if (existing) return ramp(existing); await requireBalance(input.vaultAccountId, input.assetId); if (compareDecimal(input.assetAmount, "0") <= 0 || compareDecimal(input.fiatAmount, "0") <= 0) throw new Error("Ramp amounts must be positive"); const createdAt = now(); const row = { id: randomUUID(), ...input, paymentReference: input.paymentReference ?? null, status: "PENDING", failureReason: null, completionAt: new Date(createdAt.getTime() + rampDelay), intendedOutcome: options.rampOutcomes?.[input.idempotencyKey] ?? options.defaultRampOutcome ?? "COMPLETED", createdAt, updatedAt: createdAt }; await db.insert(fireblocksRampRequests).values(row); return ramp(row); },
    async getRampRequest(id) { await resolveDue(); const [row] = await db.select().from(fireblocksRampRequests).where(eq(fireblocksRampRequests.id, id)); return row ? ramp(row) : null; },
    async listRampRequests(filter) { await resolveDue(); const rows = await db.select().from(fireblocksRampRequests); return rows.filter((item) => !filter?.vaultAccountId || item.vaultAccountId === filter.vaultAccountId).map(ramp); },
    async grantEligibility(vaultAccountId, assetId) { await resolveDue(); await state(vaultAccountId, assetId, true, (await getFreeze(vaultAccountId, assetId)).frozen, (await getFreeze(vaultAccountId, assetId)).reason); return getEligibility(vaultAccountId, assetId); },
    async revokeEligibility(vaultAccountId, assetId) { await resolveDue(); const freeze = await getFreeze(vaultAccountId, assetId); await state(vaultAccountId, assetId, false, freeze.frozen, freeze.reason); return getEligibility(vaultAccountId, assetId); },
    async getEligibility(vaultAccountId, assetId) { await resolveDue(); return getEligibility(vaultAccountId, assetId); },
    async freezeAccount(vaultAccountId, assetId, reason) { await resolveDue(); const eligibility = await getEligibility(vaultAccountId, assetId); await state(vaultAccountId, assetId, eligibility.eligible, true, reason ?? null); return getFreeze(vaultAccountId, assetId); },
    async unfreezeAccount(vaultAccountId, assetId) { await resolveDue(); const eligibility = await getEligibility(vaultAccountId, assetId); await state(vaultAccountId, assetId, eligibility.eligible, false, null); return getFreeze(vaultAccountId, assetId); },
    async pauseAsset(assetId, reason) { await resolveDue(); const updatedAt = now(); await db.insert(fireblocksAssetPauses).values({ assetId, paused: true, reason: reason ?? null, updatedAt }).onConflictDoUpdate({ target: fireblocksAssetPauses.assetId, set: { paused: true, reason: reason ?? null, updatedAt } }); return { assetId, paused: true, reason: reason ?? null, updatedAt: stamp(updatedAt) }; },
    async unpauseAsset(assetId) { await resolveDue(); const updatedAt = now(); await db.insert(fireblocksAssetPauses).values({ assetId, paused: false, reason: null, updatedAt }).onConflictDoUpdate({ target: fireblocksAssetPauses.assetId, set: { paused: false, reason: null, updatedAt } }); return { assetId, paused: false, reason: null, updatedAt: stamp(updatedAt) }; },
    async mintAsset(input) { return assetOperation(input, "MINT"); },
    async burnAsset(input) { return assetOperation(input, "BURN"); },
  };
  async function getEligibility(vaultAccountId: string, assetId: string): Promise<EligibilityState> { await requireBalance(vaultAccountId, assetId); const [row] = await db.select().from(fireblocksEligibility).where(and(eq(fireblocksEligibility.vaultAccountId, vaultAccountId), eq(fireblocksEligibility.assetId, assetId))); return { vaultAccountId, assetId, eligible: row?.eligible ?? true, updatedAt: stamp(row?.updatedAt ?? now()) }; }
  async function getFreeze(vaultAccountId: string, assetId: string): Promise<AccountFreezeState> { await requireBalance(vaultAccountId, assetId); const [row] = await db.select().from(fireblocksAccountFreezes).where(and(eq(fireblocksAccountFreezes.vaultAccountId, vaultAccountId), eq(fireblocksAccountFreezes.assetId, assetId))); return { vaultAccountId, assetId, frozen: row?.frozen ?? false, reason: row?.reason ?? null, updatedAt: stamp(row?.updatedAt ?? now()) }; }
  async function assetOperation(input: MintBurnInput, type: "MINT" | "BURN"): Promise<MintBurnResult> { await resolveDue(); const [existing] = await db.select().from(fireblocksAssetOperations).where(eq(fireblocksAssetOperations.idempotencyKey, input.idempotencyKey)); if (existing) return { id: existing.id, type: existing.type as "MINT" | "BURN", vaultAccountId: existing.vaultAccountId, assetId: existing.assetId, amount: existing.amount, idempotencyKey: existing.idempotencyKey, createdAt: stamp(existing.createdAt) }; const current = await requireBalance(input.vaultAccountId, input.assetId); const [pause] = await db.select().from(fireblocksAssetPauses).where(eq(fireblocksAssetPauses.assetId, input.assetId)); if (pause?.paused) throw new AssetPausedError(input.assetId); if (compareDecimal(input.amount, "0") <= 0) throw new Error("Asset operation amount must be positive"); if (type === "BURN" && compareDecimal(input.amount, current.available) > 0) throw new InsufficientBalanceError(input.vaultAccountId, input.assetId, input.amount, current.available); await changeBalance(input.vaultAccountId, input.assetId, input.amount, type === "MINT" ? "add" : "sub"); const createdAt = now(); const row = { id: randomUUID(), type, vaultAccountId: input.vaultAccountId, assetId: input.assetId, amount: input.amount, idempotencyKey: input.idempotencyKey, note: input.note ?? null, createdAt }; await db.insert(fireblocksAssetOperations).values(row); return { id: row.id, type, vaultAccountId: row.vaultAccountId, assetId: row.assetId, amount: row.amount, idempotencyKey: row.idempotencyKey, createdAt: stamp(createdAt) }; }
  return { provider, fund: async (vaultAccountId, assetId, amount) => { await resolveDue(); if (compareDecimal(amount, "0") <= 0) throw new Error("Funding amount must be positive"); await changeBalance(vaultAccountId, assetId, amount, "add"); }, settle };
}
