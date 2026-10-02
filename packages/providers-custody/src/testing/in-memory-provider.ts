import { randomUUID } from "node:crypto";
import { AccountFrozenError, AssetNotEnabledError, AssetPausedError, InsufficientBalanceError, NotEligibleError, VaultAccountNotFoundError } from "../errors";
import type { CustodyProvider } from "../port";
import type { AccountFreezeState, AssetId, AssetPauseState, Balance, CreateRampRequestInput, CreateTransferInput, DepositAddress, EligibilityState, MintBurnInput, RampRequest, Transfer, VaultAccount } from "../types";
import type { CustodyConformanceHooks } from "../conformance";

const key = (vaultId: string, assetId: string) => `${vaultId}:${assetId}`;
const now = () => new Date().toISOString();

function parse(value: string): [bigint, number] {
  if (!/^\d+(?:\.\d+)?$/.test(value)) throw new Error(`Invalid decimal amount: ${value}`);
  const [whole, fraction = ""] = value.split(".");
  return [BigInt(`${whole}${fraction}`), fraction.length];
}
function align(value: string, scale: number): bigint { const [raw, digits] = parse(value); return raw * 10n ** BigInt(scale - digits); }
function format(raw: bigint, scale: number): string {
  const digits = raw.toString().padStart(scale + 1, "0");
  if (scale === 0) return digits;
  const output = `${digits.slice(0, -scale)}.${digits.slice(-scale)}`.replace(/\.0+$/, "").replace(/(\.\d*?)0+$/, "$1");
  return output === "" ? "0" : output;
}
function arithmetic(left: string, right: string, op: "add" | "sub" | "compare"): string | number {
  const [, leftScale] = parse(left); const [, rightScale] = parse(right); const scale = Math.max(leftScale, rightScale);
  const l = align(left, scale); const r = align(right, scale);
  if (op === "compare") return l === r ? 0 : l > r ? 1 : -1;
  return format(op === "add" ? l + r : l - r, scale);
}

export function createInMemoryCustodyProvider(): { provider: CustodyProvider; fund: NonNullable<CustodyConformanceHooks["fund"]>; settle: NonNullable<CustodyConformanceHooks["settle"]> } {
  const vaults = new Map<string, VaultAccount>();
  const enabled = new Set<string>(); const balances = new Map<string, Balance>(); const addresses = new Map<string, DepositAddress[]>();
  const transfers = new Map<string, Transfer>(); const ramps = new Map<string, RampRequest>();
  const eligibility = new Map<string, EligibilityState>(); const freezes = new Map<string, AccountFreezeState>(); const pauses = new Map<string, AssetPauseState>();
  const transferKeys = new Map<string, string>(); const rampKeys = new Map<string, string>();
  const pendingTransfers: string[] = []; const pendingRamps: string[] = [];

  const requireVault = (id: string): VaultAccount => { const vault = vaults.get(id); if (!vault) throw new VaultAccountNotFoundError(id); return vault; };
  const requireAsset = (vaultId: string, assetId: AssetId): Balance => { requireVault(vaultId); const balance = balances.get(key(vaultId, assetId)); if (!enabled.has(key(vaultId, assetId)) || !balance) throw new AssetNotEnabledError(vaultId, assetId); return balance; };
  const requireActive = (vaultId: string, assetId: AssetId): void => {
    if (pauses.get(assetId)?.paused) throw new AssetPausedError(assetId);
    if (freezes.get(key(vaultId, assetId))?.frozen) throw new AccountFrozenError(vaultId, assetId);
    if (!eligibility.get(key(vaultId, assetId))?.eligible) throw new NotEligibleError(vaultId, assetId);
  };
  const updateBalance = (vaultId: string, assetId: AssetId, amount: string, operation: "add" | "sub") => {
    const balance = requireAsset(vaultId, assetId);
    const value = arithmetic(balance.available, amount, operation) as string;
    balance.available = value; balance.total = arithmetic(balance.total, amount, operation) as string;
  };
  const setEligibility = (vaultId: string, assetId: AssetId, eligible: boolean) => { requireAsset(vaultId, assetId); const state = { vaultAccountId: vaultId, assetId, eligible, updatedAt: now() }; eligibility.set(key(vaultId, assetId), state); return state; };
  const setFreeze = (vaultId: string, assetId: AssetId, frozen: boolean, reason: string | null) => { requireAsset(vaultId, assetId); const state = { vaultAccountId: vaultId, assetId, frozen, reason, updatedAt: now() }; freezes.set(key(vaultId, assetId), state); return state; };

  const provider: CustodyProvider = {
    async createVaultAccount(input) { const account = { id: randomUUID(), name: input.name, customerRefId: input.customerRefId ?? null, createdAt: now() }; vaults.set(account.id, account); return account; },
    async getVaultAccount(id) { return vaults.get(id) ?? null; },
    async listVaultAccounts() { return [...vaults.values()]; },
    async enableAsset(vaultId, assetId) { requireVault(vaultId); const stateKey = key(vaultId, assetId); if (enabled.has(stateKey)) return; enabled.add(stateKey); balances.set(stateKey, { vaultAccountId: vaultId, assetId, total: "0", available: "0", pending: "0" }); eligibility.set(stateKey, { vaultAccountId: vaultId, assetId, eligible: true, updatedAt: now() }); freezes.set(stateKey, { vaultAccountId: vaultId, assetId, frozen: false, reason: null, updatedAt: now() }); },
    async listEnabledAssets(vaultId) { requireVault(vaultId); return [...enabled].filter((entry) => entry.startsWith(`${vaultId}:`)).map((entry) => entry.slice(vaultId.length + 1)); },
    async getBalance(vaultId, assetId) { return requireAsset(vaultId, assetId); },
    async listBalances(vaultId) { requireVault(vaultId); return [...balances.values()].filter((balance) => balance.vaultAccountId === vaultId); },
    async createDepositAddress(vaultId, assetId) { requireAsset(vaultId, assetId); const address = { id: randomUUID(), vaultAccountId: vaultId, assetId, address: `deposit_${randomUUID().replaceAll("-", "")}`, tag: null, createdAt: now() }; const stateKey = key(vaultId, assetId); addresses.set(stateKey, [...(addresses.get(stateKey) ?? []), address]); return address; },
    async listDepositAddresses(vaultId, assetId) { requireAsset(vaultId, assetId); return addresses.get(key(vaultId, assetId)) ?? []; },
    async createTransfer(input: CreateTransferInput) {
      const existing = transferKeys.get(input.idempotencyKey); if (existing) return transfers.get(existing)!;
      const source = requireAsset(input.sourceVaultAccountId, input.assetId); requireActive(input.sourceVaultAccountId, input.assetId);
      if (input.destination.type === "VAULT_ACCOUNT") { requireAsset(input.destination.vaultAccountId, input.assetId); requireActive(input.destination.vaultAccountId, input.assetId); }
      if (arithmetic(input.amount, "0", "compare") as number <= 0) throw new Error("Transfer amount must be positive");
      if ((arithmetic(input.amount, source.available, "compare") as number) > 0) throw new InsufficientBalanceError(input.sourceVaultAccountId, input.assetId, input.amount, source.available);
      const createdAt = now(); const transfer: Transfer = { id: randomUUID(), assetId: input.assetId, amount: input.amount, sourceVaultAccountId: input.sourceVaultAccountId, destination: input.destination, direction: input.destination.type === "VAULT_ACCOUNT" ? "internal" : "external", status: "SUBMITTED", note: input.note ?? null, externalTxId: input.externalTxId ?? null, idempotencyKey: input.idempotencyKey, failureReason: null, createdAt, updatedAt: createdAt };
      transfers.set(transfer.id, transfer); transferKeys.set(input.idempotencyKey, transfer.id); pendingTransfers.push(transfer.id); return transfer;
    },
    async getTransfer(id) { return transfers.get(id) ?? null; },
    async listTransfers(filter) { return [...transfers.values()].filter((transfer) => !filter?.vaultAccountId || transfer.sourceVaultAccountId === filter.vaultAccountId || (transfer.destination.type === "VAULT_ACCOUNT" && transfer.destination.vaultAccountId === filter.vaultAccountId)); },
    async createRampRequest(input: CreateRampRequestInput) { const existing = rampKeys.get(input.idempotencyKey); if (existing) return ramps.get(existing)!; requireAsset(input.vaultAccountId, input.assetId); const createdAt = now(); const request: RampRequest = { id: randomUUID(), vaultAccountId: input.vaultAccountId, direction: input.direction, fiatCurrency: input.fiatCurrency, fiatAmount: input.fiatAmount, assetId: input.assetId, assetAmount: input.assetAmount, status: "PENDING", paymentReference: input.paymentReference ?? null, idempotencyKey: input.idempotencyKey, failureReason: null, createdAt, updatedAt: createdAt }; ramps.set(request.id, request); rampKeys.set(input.idempotencyKey, request.id); pendingRamps.push(request.id); return request; },
    async getRampRequest(id) { return ramps.get(id) ?? null; },
    async listRampRequests(filter) { return [...ramps.values()].filter((request) => !filter?.vaultAccountId || request.vaultAccountId === filter.vaultAccountId); },
    async grantEligibility(vaultId, assetId) { return setEligibility(vaultId, assetId, true); }, async revokeEligibility(vaultId, assetId) { return setEligibility(vaultId, assetId, false); }, async getEligibility(vaultId, assetId) { requireAsset(vaultId, assetId); return eligibility.get(key(vaultId, assetId))!; },
    async freezeAccount(vaultId, assetId, reason) { return setFreeze(vaultId, assetId, true, reason ?? null); }, async unfreezeAccount(vaultId, assetId) { return setFreeze(vaultId, assetId, false, null); },
    async pauseAsset(assetId, reason) { const state = { assetId, paused: true, reason: reason ?? null, updatedAt: now() }; pauses.set(assetId, state); return state; }, async unpauseAsset(assetId) { const state = { assetId, paused: false, reason: null, updatedAt: now() }; pauses.set(assetId, state); return state; },
    async mintAsset(input: MintBurnInput) { requireAsset(input.vaultAccountId, input.assetId); if (pauses.get(input.assetId)?.paused) throw new AssetPausedError(input.assetId); updateBalance(input.vaultAccountId, input.assetId, input.amount, "add"); return { id: randomUUID(), type: "MINT", vaultAccountId: input.vaultAccountId, assetId: input.assetId, amount: input.amount, idempotencyKey: input.idempotencyKey, createdAt: now() }; },
    async burnAsset(input: MintBurnInput) { const balance = requireAsset(input.vaultAccountId, input.assetId); if (pauses.get(input.assetId)?.paused) throw new AssetPausedError(input.assetId); if ((arithmetic(input.amount, balance.available, "compare") as number) > 0) throw new InsufficientBalanceError(input.vaultAccountId, input.assetId, input.amount, balance.available); updateBalance(input.vaultAccountId, input.assetId, input.amount, "sub"); return { id: randomUUID(), type: "BURN", vaultAccountId: input.vaultAccountId, assetId: input.assetId, amount: input.amount, idempotencyKey: input.idempotencyKey, createdAt: now() }; },
  };
  return { provider, async fund(vaultId, assetId, amount) { updateBalance(vaultId, assetId, amount, "add"); }, async settle() { for (const id of pendingTransfers.splice(0)) { const transfer = transfers.get(id)!; updateBalance(transfer.sourceVaultAccountId, transfer.assetId, transfer.amount, "sub"); if (transfer.destination.type === "VAULT_ACCOUNT") updateBalance(transfer.destination.vaultAccountId, transfer.assetId, transfer.amount, "add"); transfer.status = "COMPLETED"; transfer.updatedAt = now(); } for (const id of pendingRamps.splice(0)) { const request = ramps.get(id)!; if (request.direction === "ON_RAMP") updateBalance(request.vaultAccountId, request.assetId, request.assetAmount, "add"); request.status = "COMPLETED"; request.updatedAt = now(); } } };
}
