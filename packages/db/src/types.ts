import type {
  accounts,
  balances,
  holdings,
  marketTokens,
  orderBookLevels,
  positions,
  projectStories,
  projects,
  purchaseOptions,
  sessions,
  stages,
  transactions,
  units,
  users,
} from "./schema";

export type KycStatus = "pending" | "approved" | "rejected" | "none";
export type ProjectStatus = "PRE_SALE" | "IN_CONSTRUCTION" | "COMPLETED";
export type PositionSide = "BUY" | "SELL";
export type PositionStatus = "OPEN" | "PARTIALLY_FILLED" | "FILLED" | "CANCELLED";
export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "BUY" | "SELL" | "DIVIDEND";
export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";
export type OrderBookSide = "ask" | "bid";
export type CurrencyCode = "USDT";

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
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
export type OrderBookLevel = typeof orderBookLevels.$inferSelect;
export type NewOrderBookLevel = typeof orderBookLevels.$inferInsert;
