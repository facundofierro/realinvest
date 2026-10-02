import { relations } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import type {
  CurrencyCode,
  KycStatus,
  PositionSide,
  PositionStatus,
  ProjectStatus,
  TransactionStatus,
  TransactionType,
} from "./types";

export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  image: text("image"),
  kycStatus: text("kyc_status").$type<KycStatus>().notNull().default("none"),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (table) => [primaryKey({ columns: [table.provider, table.providerAccountId] }), index("accounts_user_id_idx").on(table.userId)],
);

export const sessions = sqliteTable(
  "sessions",
  {
    sessionToken: text("session_token").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

/** Single-use authorization codes delivered to native apps through an OS deep link. */
export const nativeAuthCodes = sqliteTable(
  "native_auth_codes",
  {
    code: text("code").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    redirectUri: text("redirect_uri").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
    consumedAt: integer("consumed_at", { mode: "timestamp" }),
  },
  (table) => [index("native_auth_codes_user_id_idx").on(table.userId)],
);

/** Opaque, rotating refresh credentials for native sessions. */
export const nativeRefreshTokens = sqliteTable(
  "native_refresh_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    rotatedFromId: text("rotated_from_id"),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
    consumedAt: integer("consumed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [index("native_refresh_tokens_user_id_idx").on(table.userId)],
);

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  location: text("location").notNull(),
  image: text("image").notNull(),
  status: text("status").$type<ProjectStatus>().notNull(),
  roiPct: real("roi_pct").notNull(),
  progressPct: integer("progress_pct").notNull(),
  priceRangeUsd: text("price_range_usd"),
  fixedRentPct: real("fixed_rent_pct"),
  tokensTotal: integer("tokens_total"),
  launchDate: text("launch_date"),
  nextLaunchDate: text("next_launch_date"),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
});

export const units = sqliteTable(
  "units",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    projectId: text("project_id").notNull().references(() => projects.id),
    unitCode: text("unit_code").notNull(),
    title: text("title").notNull(),
    type: text("type").notNull(),
    floor: text("floor").notNull(),
    tokenSymbol: text("token_symbol"),
    tokenName: text("token_name"),
    isTokenized: integer("is_tokenized", { mode: "boolean" }).notNull(),
    status: text("status").notNull(),
    statusRaw: text("status_raw"),
    price: text("price").notNull(),
    areaM2: real("area_m2"),
    area: text("area"),
    bedrooms: integer("bedrooms"),
    bathrooms: integer("bathrooms"),
    floorPlanImage: text("floor_plan_image"),
    investmentType: text("investment_type"),
    queueOrder: integer("queue_order"),
    orientation: text("orientation"),
    totalTokens: integer("total_tokens"),
    tokensSold: integer("tokens_sold"),
    negotiatedAmount: text("negotiated_amount"),
  },
  (table) => [index("units_project_id_idx").on(table.projectId), uniqueIndex("units_project_id_unit_code_unique").on(table.projectId, table.unitCode)],
);

export const stages = sqliteTable(
  "stages",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: text("project_id").notNull().references(() => projects.id),
    name: text("name").notNull(),
    date: text("date").notNull(),
    status: text("status").notNull(),
    units: integer("units").notNull(),
    available: integer("available").notNull(),
    minPrice: real("min_price").notNull(),
  },
  (table) => [index("stages_project_id_idx").on(table.projectId)],
);

export const purchaseOptions = sqliteTable("purchase_options", {
  key: text("key").primaryKey(),
  title: text("title").notNull(), subtitle: text("subtitle").notNull(), headerIcon: text("header_icon").notNull(),
  headerIconClassName: text("header_icon_class_name").notNull(), watermarkIcon: text("watermark_icon").notNull(),
  cardClassName: text("card_class_name").notNull(), badgeText: text("badge_text").notNull(),
  badgeClassName: text("badge_class_name").notNull(), valueLabel: text("value_label").notNull(), value: text("value").notNull(),
  actionText: text("action_text").notNull(), getHref: text("get_href").notNull(), actionClassName: text("action_class_name").notNull(),
  iconContainerClassName: text("icon_container_class_name").notNull(),
});

export const projectStories = sqliteTable("project_stories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  image: text("image").notNull(),
  color: text("color").notNull(),
});

export const marketTokens = sqliteTable(
  "market_tokens",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    symbol: text("symbol").notNull().unique(),
    projectId: text("project_id").notNull().references(() => projects.id),
    unitId: text("unit_id").references(() => units.id),
    priceUsd: real("price_usd").notNull(), marketCapUsd: real("market_cap_usd").notNull(),
    change24hPct: real("change_24h_pct").notNull(), change7dPct: real("change_7d_pct").notNull(),
    change30dPct: real("change_30d_pct").notNull(), changeAllPct: real("change_all_pct").notNull(),
    liveSince: text("live_since").notNull(), tokensAvailable: integer("tokens_available"), roiPct: real("roi_pct"),
    buyPriceUsd: real("buy_price_usd"), sellPriceUsd: real("sell_price_usd"),
  },
  (table) => [index("market_tokens_project_id_idx").on(table.projectId)],
);

export const holdings = sqliteTable(
  "holdings",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenId: text("token_id").notNull().references(() => marketTokens.id),
    tokens: integer("tokens").notNull(), lockedTokens: integer("locked_tokens").notNull().default(0), costBasisPriceUsd: real("cost_basis_price_usd"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("holdings_user_id_token_id_unique").on(table.userId, table.tokenId), index("holdings_user_id_idx").on(table.userId)],
);

export const balances = sqliteTable(
  "balances",
  {
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    currencyCode: text("currency_code").$type<CurrencyCode>().notNull(),
    available: real("available").notNull().default(0), locked: real("locked").notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.userId, table.currencyCode] })],
);

export const positions = sqliteTable(
  "positions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenId: text("token_id").notNull().references(() => marketTokens.id),
    side: text("side").$type<PositionSide>().notNull(), totalAmount: integer("total_amount").notNull(),
    filledAmount: integer("filled_amount").notNull().default(0), orderPriceUsd: real("order_price_usd").notNull(),
    openedMarketPriceUsd: real("opened_market_price_usd"),
    openedAt: integer("opened_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    status: text("status").$type<PositionStatus>().notNull().default("OPEN"),
  },
  (table) => [index("positions_user_id_status_idx").on(table.userId, table.status), index("positions_token_id_idx").on(table.tokenId)],
);

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<TransactionType>().notNull(), status: text("status").$type<TransactionStatus>().notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    amount: real("amount").notNull(), currencyCode: text("currency_code").$type<CurrencyCode>().notNull().default("USDT"),
    description: text("description"), metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown>>(),
  },
  (table) => [index("transactions_user_id_created_at_idx").on(table.userId, table.createdAt)],
);

export const trades = sqliteTable(
  "trades",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    tokenId: text("token_id").notNull().references(() => marketTokens.id, { onDelete: "cascade" }),
    price: real("price").notNull(), amount: integer("amount").notNull(),
    takerSide: text("taker_side").$type<PositionSide>().notNull(),
    buyPositionId: text("buy_position_id").notNull().references(() => positions.id),
    sellPositionId: text("sell_position_id").notNull().references(() => positions.id),
    buyUserId: text("buy_user_id").notNull().references(() => users.id),
    sellUserId: text("sell_user_id").notNull().references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [index("trades_token_id_created_at_idx").on(table.tokenId, table.createdAt)],
);

export const kycApplications = sqliteTable(
  "kyc_applications",
  {
    id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    status: text("status").$type<KycStatus>().notNull().default("none"),
    identity: text("identity", { mode: "json" }).$type<Record<string, unknown>>(),
    documents: text("documents", { mode: "json" }).$type<Record<string, unknown>[]>(),
    beneficialOwners: text("beneficial_owners", { mode: "json" }).$type<Record<string, unknown>[]>(),
    screening: text("screening", { mode: "json" }).$type<Record<string, unknown>>(),
    rejectionReason: text("rejection_reason"),
    submittedAt: integer("submitted_at", { mode: "timestamp" }),
    decidedAt: integer("decided_at", { mode: "timestamp" }),
    autoDecideAt: integer("auto_decide_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [
    uniqueIndex("kyc_applications_user_id_unique").on(table.userId),
    index("kyc_applications_status_idx").on(table.status),
  ],
);

/** Provider-native state for the deterministic Fireblocks custody mock. */
export const fireblocksVaultAccounts = sqliteTable("fireblocks_vault_accounts", {
  id: text("id").primaryKey(), name: text("name").notNull(), customerRefId: text("customer_ref_id"), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
export const fireblocksVaultAssets = sqliteTable("fireblocks_vault_assets", {
  vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id, { onDelete: "cascade" }), assetId: text("asset_id").notNull(), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [primaryKey({ columns: [table.vaultAccountId, table.assetId] })]);
export const fireblocksBalances = sqliteTable("fireblocks_balances", {
  vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id, { onDelete: "cascade" }), assetId: text("asset_id").notNull(), total: text("total").notNull().default("0"), available: text("available").notNull().default("0"), pending: text("pending").notNull().default("0"), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [primaryKey({ columns: [table.vaultAccountId, table.assetId] })]);
export const fireblocksDepositAddresses = sqliteTable("fireblocks_deposit_addresses", {
  id: text("id").primaryKey(), vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id, { onDelete: "cascade" }), assetId: text("asset_id").notNull(), address: text("address").notNull(), tag: text("tag"), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
}, (table) => [index("fireblocks_deposit_addresses_vault_asset_idx").on(table.vaultAccountId, table.assetId)]);
export const fireblocksTransfers = sqliteTable("fireblocks_transfers", {
  id: text("id").primaryKey(), assetId: text("asset_id").notNull(), amount: text("amount").notNull(), sourceVaultAccountId: text("source_vault_account_id").notNull().references(() => fireblocksVaultAccounts.id), destinationType: text("destination_type").notNull(), destinationVaultAccountId: text("destination_vault_account_id").references(() => fireblocksVaultAccounts.id), destinationAddress: text("destination_address"), destinationTag: text("destination_tag"), direction: text("direction").notNull(), status: text("status").notNull(), note: text("note"), externalTxId: text("external_tx_id"), idempotencyKey: text("idempotency_key").notNull().unique(), failureReason: text("failure_reason"), confirmingAt: integer("confirming_at", { mode: "timestamp" }).notNull(), completionAt: integer("completion_at", { mode: "timestamp" }).notNull(), intendedOutcome: text("intended_outcome").notNull(), createdAt: integer("created_at", { mode: "timestamp" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [index("fireblocks_transfers_source_idx").on(table.sourceVaultAccountId), index("fireblocks_transfers_destination_idx").on(table.destinationVaultAccountId)]);
export const fireblocksRampRequests = sqliteTable("fireblocks_ramp_requests", {
  id: text("id").primaryKey(), vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id), direction: text("direction").notNull(), fiatCurrency: text("fiat_currency").notNull(), fiatAmount: text("fiat_amount").notNull(), assetId: text("asset_id").notNull(), assetAmount: text("asset_amount").notNull(), status: text("status").notNull(), paymentReference: text("payment_reference"), idempotencyKey: text("idempotency_key").notNull().unique(), failureReason: text("failure_reason"), completionAt: integer("completion_at", { mode: "timestamp" }).notNull(), intendedOutcome: text("intended_outcome").notNull(), createdAt: integer("created_at", { mode: "timestamp" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [index("fireblocks_ramp_requests_vault_idx").on(table.vaultAccountId)]);
export const fireblocksEligibility = sqliteTable("fireblocks_eligibility", {
  vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id, { onDelete: "cascade" }), assetId: text("asset_id").notNull(), eligible: integer("eligible", { mode: "boolean" }).notNull(), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [primaryKey({ columns: [table.vaultAccountId, table.assetId] })]);
export const fireblocksAccountFreezes = sqliteTable("fireblocks_account_freezes", {
  vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id, { onDelete: "cascade" }), assetId: text("asset_id").notNull(), frozen: integer("frozen", { mode: "boolean" }).notNull(), reason: text("reason"), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
}, (table) => [primaryKey({ columns: [table.vaultAccountId, table.assetId] })]);
export const fireblocksAssetPauses = sqliteTable("fireblocks_asset_pauses", {
  assetId: text("asset_id").primaryKey(), paused: integer("paused", { mode: "boolean" }).notNull(), reason: text("reason"), updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
export const fireblocksAssetOperations = sqliteTable("fireblocks_asset_operations", {
  id: text("id").primaryKey(), type: text("type").notNull(), vaultAccountId: text("vault_account_id").notNull().references(() => fireblocksVaultAccounts.id), assetId: text("asset_id").notNull(), amount: text("amount").notNull(), idempotencyKey: text("idempotency_key").notNull().unique(), note: text("note"), createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({ accounts: many(accounts), sessions: many(sessions), holdings: many(holdings), balances: many(balances), positions: many(positions), transactions: many(transactions), kycApplications: many(kycApplications) }));
export const accountsRelations = relations(accounts, ({ one }) => ({ user: one(users, { fields: [accounts.userId], references: [users.id] }) }));
export const sessionsRelations = relations(sessions, ({ one }) => ({ user: one(users, { fields: [sessions.userId], references: [users.id] }) }));
export const projectsRelations = relations(projects, ({ many }) => ({ units: many(units), marketTokens: many(marketTokens), stages: many(stages) }));
export const unitsRelations = relations(units, ({ one, many }) => ({ project: one(projects, { fields: [units.projectId], references: [projects.id] }), marketTokens: many(marketTokens) }));
export const stagesRelations = relations(stages, ({ one }) => ({ project: one(projects, { fields: [stages.projectId], references: [projects.id] }) }));
export const marketTokensRelations = relations(marketTokens, ({ one, many }) => ({ project: one(projects, { fields: [marketTokens.projectId], references: [projects.id] }), unit: one(units, { fields: [marketTokens.unitId], references: [units.id] }), holdings: many(holdings), positions: many(positions), trades: many(trades) }));
export const holdingsRelations = relations(holdings, ({ one }) => ({ user: one(users, { fields: [holdings.userId], references: [users.id] }), token: one(marketTokens, { fields: [holdings.tokenId], references: [marketTokens.id] }) }));
export const balancesRelations = relations(balances, ({ one }) => ({ user: one(users, { fields: [balances.userId], references: [users.id] }) }));
export const positionsRelations = relations(positions, ({ one }) => ({ user: one(users, { fields: [positions.userId], references: [users.id] }), token: one(marketTokens, { fields: [positions.tokenId], references: [marketTokens.id] }) }));
export const transactionsRelations = relations(transactions, ({ one }) => ({ user: one(users, { fields: [transactions.userId], references: [users.id] }) }));
export const tradesRelations = relations(trades, ({ one }) => ({ token: one(marketTokens, { fields: [trades.tokenId], references: [marketTokens.id] }) }));
export const kycApplicationsRelations = relations(kycApplications, ({ one }) => ({ user: one(users, { fields: [kycApplications.userId], references: [users.id] }) }));

export const schema = { users, accounts, sessions, nativeAuthCodes, nativeRefreshTokens, projects, units, stages, purchaseOptions, projectStories, marketTokens, holdings, balances, positions, transactions, trades, kycApplications, fireblocksVaultAccounts, fireblocksVaultAssets, fireblocksBalances, fireblocksDepositAddresses, fireblocksTransfers, fireblocksRampRequests, fireblocksEligibility, fireblocksAccountFreezes, fireblocksAssetPauses, fireblocksAssetOperations, usersRelations, accountsRelations, sessionsRelations, projectsRelations, unitsRelations, stagesRelations, marketTokensRelations, holdingsRelations, balancesRelations, positionsRelations, transactionsRelations, tradesRelations, kycApplicationsRelations };
