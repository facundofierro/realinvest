export type CustodyErrorCode = "VAULT_ACCOUNT_NOT_FOUND" | "ASSET_NOT_ENABLED" | "INSUFFICIENT_BALANCE" | "INVALID_DESTINATION" | "TRANSFER_NOT_FOUND" | "RAMP_REQUEST_NOT_FOUND" | "UNSUPPORTED_ASSET" | "VALIDATION_ERROR" | "ACCOUNT_FROZEN" | "ASSET_PAUSED" | "NOT_ELIGIBLE";

export class CustodyProviderError extends Error {
  readonly code: CustodyErrorCode;
  constructor(code: CustodyErrorCode, message: string, options?: ErrorOptions) { super(message, options); this.name = new.target.name; this.code = code; }
}
export class VaultAccountNotFoundError extends CustodyProviderError { constructor(id: string) { super("VAULT_ACCOUNT_NOT_FOUND", `Vault account not found: ${id}`); } }
export class AssetNotEnabledError extends CustodyProviderError { constructor(vaultId: string, assetId: string) { super("ASSET_NOT_ENABLED", `Asset ${assetId} is not enabled on vault account ${vaultId}`); } }
export class InsufficientBalanceError extends CustodyProviderError { constructor(vaultId: string, assetId: string, requested: string, available: string) { super("INSUFFICIENT_BALANCE", `Insufficient ${assetId} balance on vault account ${vaultId}: requested ${requested}, available ${available}`); } }
export class InvalidDestinationError extends CustodyProviderError { constructor(message: string) { super("INVALID_DESTINATION", message); } }
export class TransferNotFoundError extends CustodyProviderError { constructor(id: string) { super("TRANSFER_NOT_FOUND", `Transfer not found: ${id}`); } }
export class RampRequestNotFoundError extends CustodyProviderError { constructor(id: string) { super("RAMP_REQUEST_NOT_FOUND", `Ramp request not found: ${id}`); } }
export class UnsupportedAssetError extends CustodyProviderError { constructor(assetId: string) { super("UNSUPPORTED_ASSET", `Unsupported asset: ${assetId}`); } }
export class CustodyValidationError extends CustodyProviderError { constructor(message: string) { super("VALIDATION_ERROR", message); } }
export class AccountFrozenError extends CustodyProviderError { constructor(vaultId: string, assetId: string) { super("ACCOUNT_FROZEN", `Vault account ${vaultId} is frozen for asset ${assetId}`); } }
export class AssetPausedError extends CustodyProviderError { constructor(assetId: string) { super("ASSET_PAUSED", `Asset ${assetId} is paused`); } }
export class NotEligibleError extends CustodyProviderError { constructor(vaultId: string, assetId: string) { super("NOT_ELIGIBLE", `Vault account ${vaultId} is not eligible to transact in ${assetId}`); } }
