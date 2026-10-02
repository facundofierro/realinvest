import type {
  accounts,
  balances,
  fireblocksAccountFreezes,
  fireblocksAssetOperations,
  fireblocksAssetPauses,
  fireblocksBalances,
  fireblocksDepositAddresses,
  fireblocksEligibility,
  fireblocksRampRequests,
  fireblocksTransfers,
  fireblocksVaultAccounts,
  fireblocksVaultAssets,
  holdings,
  kycApplications,
  marketTokens,
  nativeAuthCodes,
  nativeRefreshTokens,
  positions,
  projectStories,
  projects,
  purchaseOptions,
  sessions,
  stages,
  transactions,
  trades,
  units,
  users,
} from "./schema";

export type KycStatus = "pending" | "approved" | "rejected" | "none";
export type ProjectStatus = "PRE_SALE" | "IN_CONSTRUCTION" | "COMPLETED";
export type PositionSide = "BUY" | "SELL";
export type PositionStatus = "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "BUY" | "SELL" | "DIVIDEND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type CurrencyCode = "USDT";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type NativeAuthCode = typeof nativeAuthCodes.$inferSelect;
export type NewNativeAuthCode = typeof nativeAuthCodes.$inferInsert;
export type NativeRefreshToken = typeof nativeRefreshTokens.$inferSelect;
export type NewNativeRefreshToken = typeof nativeRefreshTokens.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Unit = typeof units.$inferSelect;
export type NewUnit = typeof units.$inferInsert;
export type Stage = typeof stages.$inferSelect;
export type NewStage = typeof stages.$inferInsert;
export type PurchaseOption = typeof purchaseOptions.$inferSelect;
export type NewPurchaseOption = typeof purchaseOptions.$inferInsert;
export type ProjectStory = typeof projectStories.$inferSelect;
export type NewProjectStory = typeof projectStories.$inferInsert;
export type MarketToken = typeof marketTokens.$inferSelect;
export type NewMarketToken = typeof marketTokens.$inferInsert;
export type Holding = typeof holdings.$inferSelect;
export type NewHolding = typeof holdings.$inferInsert;
export type Balance = typeof balances.$inferSelect;
export type NewBalance = typeof balances.$inferInsert;
export type Position = typeof positions.$inferSelect;
export type NewPosition = typeof positions.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Trade = typeof trades.$inferSelect;
export type NewTrade = typeof trades.$inferInsert;
export type KycApplicationRow = typeof kycApplications.$inferSelect;
export type NewKycApplicationRow = typeof kycApplications.$inferInsert;
export type FireblocksVaultAccountRow = typeof fireblocksVaultAccounts.$inferSelect;
export type FireblocksVaultAssetRow = typeof fireblocksVaultAssets.$inferSelect;
export type FireblocksBalanceRow = typeof fireblocksBalances.$inferSelect;
export type FireblocksDepositAddressRow = typeof fireblocksDepositAddresses.$inferSelect;
export type FireblocksTransferRow = typeof fireblocksTransfers.$inferSelect;
export type FireblocksRampRequestRow = typeof fireblocksRampRequests.$inferSelect;
export type FireblocksEligibilityRow = typeof fireblocksEligibility.$inferSelect;
export type FireblocksAccountFreezeRow = typeof fireblocksAccountFreezes.$inferSelect;
export type FireblocksAssetPauseRow = typeof fireblocksAssetPauses.$inferSelect;
export type FireblocksAssetOperationRow = typeof fireblocksAssetOperations.$inferSelect;
