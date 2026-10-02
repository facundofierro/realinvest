import type { AccountFreezeState, AssetId, AssetPauseState, Balance, CreateRampRequestInput, CreateTransferInput, CreateVaultAccountInput, DepositAddress, EligibilityState, MintBurnInput, MintBurnResult, RampRequest, Transfer, VaultAccount } from "./types";

export interface CustodyProvider {
  createVaultAccount(input: CreateVaultAccountInput): Promise<VaultAccount>;
  getVaultAccount(vaultAccountId: string): Promise<VaultAccount | null>;
  listVaultAccounts(): Promise<VaultAccount[]>;
  enableAsset(vaultAccountId: string, assetId: AssetId): Promise<void>;
  listEnabledAssets(vaultAccountId: string): Promise<AssetId[]>;
  getBalance(vaultAccountId: string, assetId: AssetId): Promise<Balance>;
  listBalances(vaultAccountId: string): Promise<Balance[]>;
  createDepositAddress(vaultAccountId: string, assetId: AssetId): Promise<DepositAddress>;
  listDepositAddresses(vaultAccountId: string, assetId: AssetId): Promise<DepositAddress[]>;
  createTransfer(input: CreateTransferInput): Promise<Transfer>;
  getTransfer(transferId: string): Promise<Transfer | null>;
  listTransfers(filter?: { vaultAccountId?: string }): Promise<Transfer[]>;
  createRampRequest(input: CreateRampRequestInput): Promise<RampRequest>;
  getRampRequest(rampRequestId: string): Promise<RampRequest | null>;
  listRampRequests(filter?: { vaultAccountId?: string }): Promise<RampRequest[]>;
  grantEligibility(vaultAccountId: string, assetId: AssetId): Promise<EligibilityState>;
  revokeEligibility(vaultAccountId: string, assetId: AssetId): Promise<EligibilityState>;
  getEligibility(vaultAccountId: string, assetId: AssetId): Promise<EligibilityState>;
  freezeAccount(vaultAccountId: string, assetId: AssetId, reason?: string | null): Promise<AccountFreezeState>;
  unfreezeAccount(vaultAccountId: string, assetId: AssetId): Promise<AccountFreezeState>;
  pauseAsset(assetId: AssetId, reason?: string | null): Promise<AssetPauseState>;
  unpauseAsset(assetId: AssetId): Promise<AssetPauseState>;
  mintAsset(input: MintBurnInput): Promise<MintBurnResult>;
  burnAsset(input: MintBurnInput): Promise<MintBurnResult>;
}
