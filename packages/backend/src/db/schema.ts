import { pgTable, text, integer, real, timestamp, boolean, json, serial, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const projectStatusEnum = pgEnum('project_status', ['PRE_SALE', 'IN_CONSTRUCTION', 'COMPLETED'])
export const positionSideEnum = pgEnum('position_side', ['BUY', 'SELL'])
export const positionStatusEnum = pgEnum('position_status', ['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED'])
export const transactionTypeEnum = pgEnum('transaction_type', ['DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'DIVIDEND'])
export const transactionStatusEnum = pgEnum('transaction_status', ['PENDING', 'COMPLETED', 'FAILED'])
export const currencyCodeEnum = pgEnum('currency_code', ['USDT'])
export const unitStatusEnum = pgEnum('unit_status', ['available', 'sold_out', 'upcoming', 'blocked'])
export const investmentTypeEnum = pgEnum('investment_type', ['fixed_rent', 'appreciation', 'construction', 'full_property'])

// Projects table
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  location: text('location').notNull(),
  image: text('image').notNull(),
  status: projectStatusEnum('status').notNull(),
  roiPct: real('roi_pct').notNull(),
  progressPct: real('progress_pct').notNull(),
  priceRangeUsd: text('price_range_usd'),
  fixedRentPct: real('fixed_rent_pct'),
  tokensTotal: integer('tokens_total'),
  launchDate: text('launch_date'),
  nextLaunchDate: text('next_launch_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Project units table
export const projectUnits = pgTable('project_units', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  unitCode: text('unit_code').notNull(),
  title: text('title').notNull(),
  type: text('type').notNull(),
  floor: text('floor').notNull(),
  areaM2: integer('area_m2'),
  area: text('area'),
  bedrooms: integer('bedrooms'),
  bathrooms: integer('bathrooms'),
  floorPlanImage: text('floor_plan_image'),
  tokenSymbol: text('token_symbol'),
  tokenName: text('token_name'),
  isTokenized: boolean('is_tokenized').notNull().default(false),
  investmentType: investmentTypeEnum('investment_type'),
  status: text('status').notNull(),
  statusRaw: unitStatusEnum('status_raw'),
  price: text('price').notNull(),
  queueOrder: integer('queue_order'),
  orientation: text('orientation'),
  totalTokens: integer('total_tokens'),
  tokensSold: integer('tokens_sold').default(0),
  negotiatedAmount: text('negotiated_amount'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Project stories table
export const projectStories = pgTable('project_stories', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  title: text('title').notNull(),
  image: text('image').notNull(),
  color: text('color').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Project stages table
export const projectStages = pgTable('project_stages', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  name: text('name').notNull(),
  date: text('date').notNull(),
  status: text('status').notNull(),
  units: integer('units').notNull(),
  available: integer('available').notNull(),
  minPrice: integer('min_price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Project purchase options table
export const projectPurchaseOptions = pgTable('project_purchase_options', {
  id: serial('id').primaryKey(),
  projectId: text('project_id').notNull().references(() => projects.id),
  key: text('key').notNull(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  headerIcon: text('header_icon').notNull(),
  headerIconClassName: text('header_icon_class_name').notNull(),
  watermarkIcon: text('watermark_icon').notNull(),
  cardClassName: text('card_class_name').notNull(),
  badgeText: text('badge_text').notNull(),
  badgeClassName: text('badge_class_name').notNull(),
  valueLabel: text('value_label').notNull(),
  value: text('value').notNull(),
  actionText: text('action_text').notNull(),
  getHref: text('get_href').notNull(),
  actionClassName: text('action_class_name').notNull(),
  iconContainerClassName: text('icon_container_class_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Market tokens table
export const marketTokens = pgTable('market_tokens', {
  id: text('id').primaryKey(),
  unitId: text('unit_id').references(() => projectUnits.id),
  symbol: text('symbol').notNull().unique(),
  projectId: text('project_id').notNull().references(() => projects.id),
  projectTitle: text('project_title').notNull(),
  priceUsd: real('price_usd').notNull(),
  marketCapUsd: real('market_cap_usd').notNull(),
  change24hPct: real('change_24h_pct').notNull(),
  change7dPct: real('change_7d_pct').notNull(),
  change30dPct: real('change_30d_pct').notNull(),
  changeAllPct: real('change_all_pct').notNull(),
  liveSince: text('live_since').notNull(),
  isFavorite: boolean('is_favorite').notNull().default(false),
  tokensAvailable: integer('tokens_available'),
  roiPct: real('roi_pct'),
  buyPriceUsd: real('buy_price_usd'),
  sellPriceUsd: real('sell_price_usd'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Wallet balances table
export const walletBalances = pgTable('wallet_balances', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  currencyCode: currencyCodeEnum('currency_code').notNull(),
  available: real('available').notNull().default(0),
  locked: real('locked').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Holdings table
export const holdings = pgTable('holdings', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenId: text('token_id').notNull().references(() => marketTokens.id),
  unitCode: text('unit_code').notNull(),
  tokenSymbol: text('token_symbol').notNull(),
  projectTitle: text('project_title').notNull(),
  location: text('location').notNull(),
  tokens: integer('tokens').notNull(),
  marketPriceUsd: real('market_price_usd').notNull(),
  costBasisPriceUsd: real('cost_basis_price_usd'),
  changePct: real('change_pct'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Positions table
export const positions = pgTable('positions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  tokenId: text('token_id').notNull().references(() => marketTokens.id),
  tokenSymbol: text('token_symbol').notNull(),
  side: positionSideEnum('side').notNull(),
  totalAmount: integer('total_amount').notNull(),
  filledAmount: integer('filled_amount').notNull().default(0),
  openedAt: timestamp('opened_at'),
  openedMarketPriceUsd: real('opened_market_price_usd'),
  orderPriceUsd: real('order_price_usd').notNull(),
  marketPriceUsd: real('market_price_usd').notNull(),
  status: positionStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Transactions table
export const transactions = pgTable('transactions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: transactionTypeEnum('type').notNull(),
  status: transactionStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').notNull(),
  currencyCode: currencyCodeEnum('currency_code').notNull(),
  amount: real('amount').notNull(),
  description: text('description'),
  metadata: json('metadata'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Orderbook levels table
export const orderbookLevels = pgTable('orderbook_levels', {
  id: serial('id').primaryKey(),
  tokenId: text('token_id').notNull().references(() => marketTokens.id),
  side: positionSideEnum('side').notNull(),
  price: real('price').notNull(),
  amount: integer('amount').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Market series table
export const marketSeries = pgTable('market_series', {
  id: serial('id').primaryKey(),
  tokenId: text('token_id').notNull().references(() => marketTokens.id),
  timestamp: timestamp('timestamp').notNull(),
  price: real('price').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  units: many(projectUnits),
  stories: many(projectStories),
  stages: many(projectStages),
  purchaseOptions: many(projectPurchaseOptions),
  tokens: many(marketTokens),
}))

export const projectUnitsRelations = relations(projectUnits, ({ one, many }) => ({
  project: one(projects, {
    fields: [projectUnits.projectId],
    references: [projects.id],
  }),
  marketToken: one(marketTokens, {
    fields: [projectUnits.tokenSymbol],
    references: [marketTokens.symbol],
  }),
}))

export const projectStoriesRelations = relations(projectStories, ({ one }) => ({
  project: one(projects, {
    fields: [projectStories.projectId],
    references: [projects.id],
  }),
}))

export const projectStagesRelations = relations(projectStages, ({ one }) => ({
  project: one(projects, {
    fields: [projectStages.projectId],
    references: [projects.id],
  }),
}))

export const projectPurchaseOptionsRelations = relations(projectPurchaseOptions, ({ one }) => ({
  project: one(projects, {
    fields: [projectPurchaseOptions.projectId],
    references: [projects.id],
  }),
}))

export const marketTokensRelations = relations(marketTokens, ({ one, many }) => ({
  project: one(projects, {
    fields: [marketTokens.projectId],
    references: [projects.id],
  }),
  unit: one(projectUnits, {
    fields: [marketTokens.unitId],
    references: [projectUnits.id],
  }),
  holdings: many(holdings),
  positions: many(positions),
  orderbookLevels: many(orderbookLevels),
  series: many(marketSeries),
}))

export const holdingsRelations = relations(holdings, ({ one }) => ({
  token: one(marketTokens, {
    fields: [holdings.tokenId],
    references: [marketTokens.id],
  }),
}))

export const positionsRelations = relations(positions, ({ one }) => ({
  token: one(marketTokens, {
    fields: [positions.tokenId],
    references: [marketTokens.id],
  }),
}))

export const orderbookLevelsRelations = relations(orderbookLevels, ({ one }) => ({
  token: one(marketTokens, {
    fields: [orderbookLevels.tokenId],
    references: [marketTokens.id],
  }),
}))

export const marketSeriesRelations = relations(marketSeries, ({ one }) => ({
  token: one(marketTokens, {
    fields: [marketSeries.tokenId],
    references: [marketTokens.id],
  }),
}))
