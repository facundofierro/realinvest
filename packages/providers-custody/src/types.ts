export type AssetId = string;

export interface VaultAccount { id: string; name: string; customerRefId: string | null; createdAt: string; }
export interface CreateVaultAccountInput { name: string; customerRefId?: string | null; }
export interface Balance { vaultAccountId: string; assetId: AssetId; total: string; available: string; pending: string; }
export interface DepositAddress { id: string; vaultAccountId: string; assetId: AssetId; address: string; tag: string | null; createdAt: string; }
export type TransferDestination = { type: "VAULT_ACCOUNT"; vaultAccountId: string } | { type: "ONE_TIME_ADDRESS"; address: string; tag?: string | null };
export type TransferDirection = "internal" | "external";
export type TransferStatus = "SUBMITTED" | "CONFIRMING" | "COMPLETED" | "FAILED";
export interface CreateTransferInput { assetId: AssetId; amount: string; sourceVaultAccountId: string; destination: TransferDestination; idempotencyKey: string; note?: string | null; externalTxId?: string | null; }
export interface Transfer { id: string; assetId: AssetId; amount: string; sourceVaultAccountId: string; destination: TransferDestination; direction: TransferDirection; status: TransferStatus; note: string | null; externalTxId: string | null; idempotencyKey: string; failureReason: string | null; createdAt: string; updatedAt: string; }
export type RampDirection = "ON_RAMP" | "OFF_RAMP";
export type RampStatus = "PENDING" | "FUNDS_RECEIVED" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
export interface CreateRampRequestInput { vaultAccountId: string; direction: RampDirection; fiatCurrency: string; fiatAmount: string; assetId: AssetId; assetAmount: string; idempotencyKey: string; paymentReference?: string | null; }
export interface RampRequest { id: string; vaultAccountId: string; direction: RampDirection; fiatCurrency: string; fiatAmount: string; assetId: AssetId; assetAmount: string; status: RampStatus; paymentReference: string | null; idempotencyKey: string; failureReason: string | null; createdAt: string; updatedAt: string; }
export interface EligibilityState { vaultAccountId: string; assetId: AssetId; eligible: boolean; updatedAt: string; }
export interface AccountFreezeState { vaultAccountId: string; assetId: AssetId; frozen: boolean; reason: string | null; updatedAt: string; }
export interface AssetPauseState { assetId: AssetId; paused: boolean; reason: string | null; updatedAt: string; }
export interface MintBurnInput { vaultAccountId: string; assetId: AssetId; amount: string; idempotencyKey: string; note?: string | null; }
export type MintBurnType = "MINT" | "BURN";
export interface MintBurnResult { id: string; type: MintBurnType; vaultAccountId: string; assetId: AssetId; amount: string; idempotencyKey: string; createdAt: string; }
