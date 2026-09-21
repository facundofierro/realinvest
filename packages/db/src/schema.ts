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
  OrderBookSide,
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
    tokens: integer("tokens").notNull(), costBasisPriceUsd: real("cost_basis_price_usd"),
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

export const orderBookLevels = sqliteTable(
  "order_book_levels",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tokenId: text("token_id").notNull().references(() => marketTokens.id, { onDelete: "cascade" }),
    side: text("side").$type<OrderBookSide>().notNull(), price: real("price").notNull(), amount: integer("amount").notNull(),
  },
  (table) => [index("order_book_levels_token_id_idx").on(table.tokenId), uniqueIndex("order_book_levels_token_id_side_price_unique").on(table.tokenId, table.side, table.price)],
);

export const usersRelations = relations(users, ({ many }) => ({ accounts: many(accounts), sessions: many(sessions), holdings: many(holdings), balances: many(balances), positions: many(positions), transactions: many(transactions) }));
export const accountsRelations = relations(accounts, ({ one }) => ({ user: one(users, { fields: [accounts.userId], references: [users.id] }) }));
export const sessionsRelations = relations(sessions, ({ one }) => ({ user: one(users, { fields: [sessions.userId], references: [users.id] }) }));
export const projectsRelations = relations(projects, ({ many }) => ({ units: many(units), marketTokens: many(marketTokens), stages: many(stages) }));
export const unitsRelations = relations(units, ({ one, many }) => ({ project: one(projects, { fields: [units.projectId], references: [projects.id] }), marketTokens: many(marketTokens) }));
export const stagesRelations = relations(stages, ({ one }) => ({ project: one(projects, { fields: [stages.projectId], references: [projects.id] }) }));
export const marketTokensRelations = relations(marketTokens, ({ one, many }) => ({ project: one(projects, { fields: [marketTokens.projectId], references: [projects.id] }), unit: one(units, { fields: [marketTokens.unitId], references: [units.id] }), holdings: many(holdings), positions: many(positions), orderBookLevels: many(orderBookLevels) }));
export const holdingsRelations = relations(holdings, ({ one }) => ({ user: one(users, { fields: [holdings.userId], references: [users.id] }), token: one(marketTokens, { fields: [holdings.tokenId], references: [marketTokens.id] }) }));
export const balancesRelations = relations(balances, ({ one }) => ({ user: one(users, { fields: [balances.userId], references: [users.id] }) }));
export const positionsRelations = relations(positions, ({ one }) => ({ user: one(users, { fields: [positions.userId], references: [users.id] }), token: one(marketTokens, { fields: [positions.tokenId], references: [marketTokens.id] }) }));
export const transactionsRelations = relations(transactions, ({ one }) => ({ user: one(users, { fields: [transactions.userId], references: [users.id] }) }));
export const orderBookLevelsRelations = relations(orderBookLevels, ({ one }) => ({ token: one(marketTokens, { fields: [orderBookLevels.tokenId], references: [marketTokens.id] }) }));

export const schema = { users, accounts, sessions, projects, units, stages, purchaseOptions, projectStories, marketTokens, holdings, balances, positions, transactions, orderBookLevels, usersRelations, accountsRelations, sessionsRelations, projectsRelations, unitsRelations, stagesRelations, marketTokensRelations, holdingsRelations, balancesRelations, positionsRelations, transactionsRelations, orderBookLevelsRelations };
