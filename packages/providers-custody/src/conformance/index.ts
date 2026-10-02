import { beforeEach, describe, expect, it } from "vitest";
import { AccountFrozenError, AssetNotEnabledError, AssetPausedError, InsufficientBalanceError, NotEligibleError, VaultAccountNotFoundError } from "../errors";
import type { CustodyProvider } from "../port";

export interface CustodyConformanceHooks {
  /** Credits a simulated inbound deposit for test setup. */
  fund?: (vaultAccountId: string, assetId: string, amount: string) => Promise<void>;
  /** Resolves queued simulated transfers and ramp requests. */
  settle?: () => Promise<void>;
}

const ASSET = "USDT";

/** Registers portable Vitest assertions for a CustodyProvider implementation. */
export function runCustodyProviderConformanceSuite(
  createProvider: () => CustodyProvider | Promise<CustodyProvider>,
  hooks: CustodyConformanceHooks = {},
): void {
  describe("CustodyProvider conformance", () => {
    let provider: CustodyProvider;
    beforeEach(async () => { provider = await createProvider(); });

    it("creates, retrieves, and lists vault accounts", async () => {
      const created = await provider.createVaultAccount({ name: "Treasury" });
      expect(await provider.getVaultAccount(created.id)).toEqual(created);
      expect(await provider.getVaultAccount("does-not-exist")).toBeNull();
      expect((await provider.listVaultAccounts()).map((vault) => vault.id)).toContain(created.id);
    });

    it("requires an enabled asset and starts it at zero balance", async () => {
      const vault = await provider.createVaultAccount({ name: "Treasury" });
      await expect(provider.getBalance(vault.id, ASSET)).rejects.toThrow(AssetNotEnabledError);
      await provider.enableAsset(vault.id, ASSET);
      expect(await provider.listEnabledAssets(vault.id)).toContain(ASSET);
      expect(await provider.getBalance(vault.id, ASSET)).toMatchObject({ total: "0", available: "0", pending: "0" });
    });

    it("creates deposit addresses scoped to an enabled vault asset", async () => {
      const vault = await provider.createVaultAccount({ name: "Treasury" });
      await provider.enableAsset(vault.id, ASSET);
      const address = await provider.createDepositAddress(vault.id, ASSET);
      expect(address.address).toBeTruthy();
      expect((await provider.listDepositAddresses(vault.id, ASSET)).map((item) => item.id)).toContain(address.id);
    });

    it("validates unknown sources and insufficient balances", async () => {
      const input = { assetId: ASSET, amount: "1", destination: { type: "ONE_TIME_ADDRESS" as const, address: "0xabc" }, idempotencyKey: "idem-invalid" };
      await expect(provider.createTransfer({ ...input, sourceVaultAccountId: "does-not-exist" })).rejects.toThrow(VaultAccountNotFoundError);
      const vault = await provider.createVaultAccount({ name: "Treasury" });
      await provider.enableAsset(vault.id, ASSET);
      await expect(provider.createTransfer({ ...input, sourceVaultAccountId: vault.id, idempotencyKey: "idem-empty" })).rejects.toThrow(InsufficientBalanceError);
    });

    it.skipIf(!hooks.fund)("moves funded internal transfers and honors idempotency", async () => {
      const source = await provider.createVaultAccount({ name: "Treasury" });
      const destination = await provider.createVaultAccount({ name: "Client" });
      await provider.enableAsset(source.id, ASSET);
      await provider.enableAsset(destination.id, ASSET);
      await hooks.fund!(source.id, ASSET, "100");
      const input = { assetId: ASSET, amount: "40", sourceVaultAccountId: source.id, destination: { type: "VAULT_ACCOUNT" as const, vaultAccountId: destination.id }, idempotencyKey: "idem-transfer" };
      const transfer = await provider.createTransfer(input);
      expect((await provider.createTransfer(input)).id).toBe(transfer.id);
      expect(["SUBMITTED", "CONFIRMING", "COMPLETED"]).toContain(transfer.status);
      if (hooks.settle) await hooks.settle();
      expect((await provider.getTransfer(transfer.id))?.status).toBe("COMPLETED");
      expect((await provider.getBalance(destination.id, ASSET)).available).toBe("40");
    });

    it("creates and retrieves pending on-ramp requests", async () => {
      const vault = await provider.createVaultAccount({ name: "Treasury" });
      await provider.enableAsset(vault.id, ASSET);
      const request = await provider.createRampRequest({ vaultAccountId: vault.id, direction: "ON_RAMP", fiatCurrency: "USD", fiatAmount: "100", assetId: ASSET, assetAmount: "100", idempotencyKey: "idem-ramp" });
      expect(request.status).toBe("PENDING");
      expect(await provider.getRampRequest(request.id)).toEqual(request);
      expect((await provider.listRampRequests({ vaultAccountId: vault.id })).map((item) => item.id)).toContain(request.id);
    });

    it.skipIf(!hooks.settle)("settles on-ramp requests", async () => {
      const vault = await provider.createVaultAccount({ name: "Treasury" });
      await provider.enableAsset(vault.id, ASSET);
      const request = await provider.createRampRequest({ vaultAccountId: vault.id, direction: "ON_RAMP", fiatCurrency: "USD", fiatAmount: "50", assetId: ASSET, assetAmount: "50", idempotencyKey: "idem-ramp-settle" });
      await hooks.settle!();
      expect((await provider.getRampRequest(request.id))?.status).toBe("COMPLETED");
    });

    it("supports token administration and enforces paused, frozen, and ineligible states", async () => {
      const source = await provider.createVaultAccount({ name: "Treasury" });
      const destination = await provider.createVaultAccount({ name: "Client" });
      await provider.enableAsset(source.id, ASSET);
      await provider.enableAsset(destination.id, ASSET);
      await provider.mintAsset({ vaultAccountId: source.id, assetId: ASSET, amount: "1000", idempotencyKey: "idem-mint" });
      expect((await provider.getBalance(source.id, ASSET)).available).toBe("1000");
      await provider.burnAsset({ vaultAccountId: source.id, assetId: ASSET, amount: "400", idempotencyKey: "idem-burn" });
      expect((await provider.getBalance(source.id, ASSET)).available).toBe("600");
      await provider.pauseAsset(ASSET, "incident");
      await expect(provider.mintAsset({ vaultAccountId: source.id, assetId: ASSET, amount: "1", idempotencyKey: "idem-paused" })).rejects.toThrow(AssetPausedError);
      await provider.unpauseAsset(ASSET);
      await provider.freezeAccount(source.id, ASSET);
      await expect(provider.createTransfer({ assetId: ASSET, amount: "1", sourceVaultAccountId: source.id, destination: { type: "ONE_TIME_ADDRESS", address: "0xabc" }, idempotencyKey: "idem-frozen" })).rejects.toThrow(AccountFrozenError);
      await provider.unfreezeAccount(source.id, ASSET);
      await provider.revokeEligibility(destination.id, ASSET);
      await expect(provider.createTransfer({ assetId: ASSET, amount: "1", sourceVaultAccountId: source.id, destination: { type: "VAULT_ACCOUNT", vaultAccountId: destination.id }, idempotencyKey: "idem-ineligible" })).rejects.toThrow(NotEligibleError);
      expect((await provider.getEligibility(destination.id, ASSET)).eligible).toBe(false);
    });
  });
}
