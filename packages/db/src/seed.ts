import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { createDb } from "./client";
import {
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
import type {
  CurrencyCode,
  NewBalance,
  NewHolding,
  NewMarketToken,
  NewOrderBookLevel,
  NewPosition,
  NewProject,
  NewProjectStory,
  NewPurchaseOption,
  NewStage,
  NewTransaction,
  NewUnit,
  NewUser,
  OrderBookSide,
  PositionSide,
  PositionStatus,
  ProjectStatus,
  TransactionStatus,
  TransactionType,
} from "./types";

const SAMPLE_DATA_DIR = path.resolve(__dirname, "../../../apps/wallet/src/sample-data");

const DEMO_USER_ID = "demo-user";
const STAGES_PROJECT_ID = "torre-libertador-8000";
const FEATURED_PROJECT_IDS = new Set(["barrio-el-ceibo", "residencial-las-heras", "oficinas-madero"]);
const HOLDING_UNIT_LINKS: Record<string, string> = { "holding-1": "torre-libertador-8000-12a" };

const DASHBOARD_STATUS_MAP: Record<string, ProjectStatus> = {
  "PRE-VENTA": "PRE_SALE",
  "EN CONSTRUCCION": "IN_CONSTRUCTION",
  COMPLETADO: "COMPLETED",
};

async function readFixture<T>(name: string): Promise<T> {
  const raw = await readFile(path.join(SAMPLE_DATA_DIR, name), "utf8");
  return JSON.parse(raw) as T;
}

type ProjectFixture = {
  id: string;
  title: string;
  location: string;
  image: string;
  status: ProjectStatus;
  roiPct: number;
  progressPct: number;
  priceRangeUsd: string;
  fixedRentPct: number;
  tokensTotal: number;
  launchDate: string;
};

type DashboardProjectFixture = {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  roi: number;
  progress: number;
  priceRange: string;
  fixedRent: number;
};

type UnitFixture = {
  id: string;
  projectId: string;
  unitCode: string;
  title: string;
  type: string;
  floor: string;
  tokenSymbol?: string;
  tokenName?: string;
  isTokenized: boolean;
  status: string;
  statusRaw?: string;
  price: string;
  areaM2?: number;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  floorPlanImage?: string;
  investmentType?: string;
  queueOrder?: number;
  orientation?: string;
  totalTokens?: number;
  tokensSold?: number;
  negotiatedAmount?: string;
};

type StageFixture = {
  id: number;
  name: string;
  date: string;
  status: string;
  units: number;
  available: number;
  minPrice: number;
};

type PurchaseOptionFixture = {
  key: string;
  title: string;
  subtitle: string;
  headerIcon: string;
  headerIconClassName: string;
  watermarkIcon: string;
  cardClassName: string;
  badgeText: string;
  badgeClassName: string;
  valueLabel: string;
  value: string;
  actionText: string;
  getHref: string;
  actionClassName: string;
  iconContainerClassName: string;
};

type StoryFixture = {
  id: number;
  title: string;
  image: string;
  color: string;
};

type MarketTokenFixture = {
  id: string;
  unitId: string;
  symbol: string;
  projectId: string;
  projectTitle: string;
  priceUsd: number;
  marketCapUsd: number;
  change24hPct: number;
  change7dPct: number;
  change30dPct: number;
  changeAllPct: number;
  liveSince: string;
  isFavorite: boolean;
  tokensAvailable: number;
  roiPct?: number;
  buyPriceUsd?: number;
  sellPriceUsd?: number;
};

type HoldingFixture = {
  id: string;
  tokenId: string;
  unitCode: string;
  tokenSymbol: string;
  projectTitle: string;
  location: string;
  tokens: number;
  marketPriceUsd: number;
  costBasisPriceUsd?: number;
  changePct: number;
};

type BalanceFixture = {
  currencyCode: CurrencyCode;
  available: number;
  locked: number;
};

type PositionFixture = {
  id: string;
  tokenId: string;
  tokenSymbol: string;
  side: PositionSide;
  totalAmount: number;
  filledAmount: number;
  openedAt: string;
  openedMarketPriceUsd: number;
  orderPriceUsd: number;
  marketPriceUsd: number;
  status: PositionStatus;
};

type TransactionFixture = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  amount: { currencyCode: CurrencyCode; amount: number };
  description?: string;
  metadata?: Record<string, unknown>;
};

type OrderBookFixture = Record<string, { asks: { price: number; amount: number }[]; bids: { price: number; amount: number }[] }>;

function mapProjects(
  projectFixtures: ProjectFixture[],
  dashboardFixtures: DashboardProjectFixture[],
  marketTokenFixtures: MarketTokenFixture[],
): NewProject[] {
  const canonicalIds = new Set(projectFixtures.map((p) => p.id));
  const canonical = projectFixtures.map((p): NewProject => ({ ...p, isFeatured: FEATURED_PROJECT_IDS.has(p.id) }));
  const dashboardOnly = dashboardFixtures
    .filter((p) => !canonicalIds.has(p.id))
    .map((p): NewProject => {
      const status = DASHBOARD_STATUS_MAP[p.status];
      if (!status) throw new Error(`Unknown dashboard project status: ${p.status}`);
      return {
        id: p.id,
        title: p.title,
        location: p.location,
        image: p.image,
        status,
        roiPct: p.roi,
        progressPct: p.progress,
        priceRangeUsd: p.priceRange,
        fixedRentPct: p.fixedRent,
        tokensTotal: null,
        launchDate: null,
        isFeatured: FEATURED_PROJECT_IDS.has(p.id),
      };
    });
  const marketProjectIds = new Set(marketTokenFixtures.map((t) => t.projectId));
  const synthesized = [...marketProjectIds].map((projectId): NewProject => {
    const token = marketTokenFixtures.find((t) => t.projectId === projectId);
    if (!token) throw new Error(`No market token found for synthesized project: ${projectId}`);
    return {
      id: projectId,
      title: token.projectTitle,
      location: "N/A",
      image: "/projects/header-tower.png",
      status: "IN_CONSTRUCTION",
      roiPct: token.roiPct ?? 0,
      progressPct: 0,
      priceRangeUsd: null,
      fixedRentPct: null,
      tokensTotal: null,
      launchDate: null,
      isFeatured: false,
    };
  });
  return [...canonical, ...dashboardOnly, ...synthesized];
}

function mapUnits(unitFixtures: UnitFixture[]): NewUnit[] {
  return unitFixtures;
}

function mapStages(stageFixtures: StageFixture[], projectId: string): NewStage[] {
  return stageFixtures.map((s) => ({ ...s, projectId }));
}

function mapPurchaseOptions(fixtures: PurchaseOptionFixture[]): NewPurchaseOption[] {
  return fixtures;
}

function mapStories(fixtures: StoryFixture[]): NewProjectStory[] {
  return fixtures;
}

function mapMarketTokens(fixtures: MarketTokenFixture[]): NewMarketToken[] {
  return fixtures.map((t) => ({
    id: t.id,
    symbol: t.symbol,
    projectId: t.projectId,
    unitId: null,
    priceUsd: t.priceUsd,
    marketCapUsd: t.marketCapUsd,
    change24hPct: t.change24hPct,
    change7dPct: t.change7dPct,
    change30dPct: t.change30dPct,
    changeAllPct: t.changeAllPct,
    liveSince: t.liveSince,
    tokensAvailable: t.tokensAvailable,
    roiPct: t.roiPct ?? null,
    buyPriceUsd: t.buyPriceUsd ?? null,
    sellPriceUsd: t.sellPriceUsd ?? null,
  }));
}

function synthesizeHoldingTokens(
  holdingFixtures: HoldingFixture[],
  marketTokenFixtures: MarketTokenFixture[],
  knownProjectIds: string[],
): NewMarketToken[] {
  const fixtureSymbols = new Set(marketTokenFixtures.map((t) => t.symbol));
  return holdingFixtures.map((h): NewMarketToken => {
    if (fixtureSymbols.has(h.tokenSymbol)) throw new Error(`Holding token symbol collides with market token fixture: ${h.tokenSymbol}`);
    const projectId = knownProjectIds.find((id) => h.tokenId.startsWith(`${id}-`));
    if (!projectId) throw new Error(`Cannot resolve project for holding token: ${h.tokenId}`);
    return {
      id: h.tokenId,
      symbol: h.tokenSymbol,
      projectId,
      unitId: HOLDING_UNIT_LINKS[h.id] ?? null,
      priceUsd: h.marketPriceUsd,
      marketCapUsd: h.tokens * h.marketPriceUsd,
      change24hPct: 0,
      change7dPct: 0,
      change30dPct: 0,
      changeAllPct: h.changePct,
      liveSince: "seed",
      tokensAvailable: null,
      roiPct: null,
      buyPriceUsd: null,
      sellPriceUsd: null,
    };
  });
}

function mapHoldings(fixtures: HoldingFixture[], userId: string): NewHolding[] {
  return fixtures.map((h) => ({
    id: h.id,
    userId,
    tokenId: h.tokenId,
    tokens: h.tokens,
    costBasisPriceUsd: h.costBasisPriceUsd ?? null,
  }));
}

function mapBalances(fixtures: BalanceFixture[], userId: string): NewBalance[] {
  return fixtures.map((b) => ({ userId, currencyCode: b.currencyCode, available: b.available, locked: b.locked }));
}

function mapPositions(fixtures: PositionFixture[], userId: string): NewPosition[] {
  return fixtures.map((p) => ({
    id: p.id,
    userId,
    tokenId: p.tokenId,
    side: p.side,
    totalAmount: p.totalAmount,
    filledAmount: p.filledAmount,
    orderPriceUsd: p.orderPriceUsd,
    openedMarketPriceUsd: p.openedMarketPriceUsd,
    openedAt: new Date(p.openedAt),
    status: p.status,
  }));
}

function mapTransactions(fixtures: TransactionFixture[], userId: string): NewTransaction[] {
  return fixtures.map((t) => ({
    id: t.id,
    userId,
    type: t.type,
    status: t.status,
    createdAt: new Date(t.createdAt),
    amount: t.amount.amount,
    currencyCode: t.amount.currencyCode,
    description: t.description ?? null,
    metadata: t.metadata ?? null,
  }));
}

function mapOrderBooks(orderBooks: OrderBookFixture, marketTokenFixtures: MarketTokenFixture[]): NewOrderBookLevel[] {
  const symbolToTokenId = new Map(marketTokenFixtures.map((t) => [t.symbol, t.id]));
  const rows: NewOrderBookLevel[] = [];
  for (const [symbol, book] of Object.entries(orderBooks)) {
    const tokenId = symbolToTokenId.get(symbol);
    if (!tokenId) throw new Error(`Order book symbol does not match any market token: ${symbol}`);
    for (const level of book.asks) rows.push({ tokenId, side: "ask" satisfies OrderBookSide, price: level.price, amount: level.amount });
    for (const level of book.bids) rows.push({ tokenId, side: "bid" satisfies OrderBookSide, price: level.price, amount: level.amount });
  }
  return rows;
}

async function main() {
  const [
    projectFixtures,
    dashboardFixtures,
    unitFixtures,
    stageFixtures,
    purchaseOptionFixtures,
    storyFixtures,
    marketTokenFixtures,
    holdingFixtures,
    balanceFixtures,
    positionFixtures,
    transactionFixtures,
    orderBookFixtures,
  ] = await Promise.all([
    readFixture<ProjectFixture[]>("projects.json"),
    readFixture<DashboardProjectFixture[]>("dashboardProjects.json"),
    readFixture<UnitFixture[]>("projectUnits.json"),
    readFixture<StageFixture[]>("projectStages.json"),
    readFixture<PurchaseOptionFixture[]>("projectPurchaseOptions.json"),
    readFixture<StoryFixture[]>("projectStories.json"),
    readFixture<MarketTokenFixture[]>("marketTokens.json"),
    readFixture<HoldingFixture[]>("walletHoldings.json"),
    readFixture<BalanceFixture[]>("walletBalances.json"),
    readFixture<PositionFixture[]>("walletPositions.json"),
    readFixture<TransactionFixture[]>("transactions.json"),
    readFixture<OrderBookFixture>("marketOrderBooks.json"),
  ]);

  const demoUser: NewUser = { id: DEMO_USER_ID, name: "Demo User", email: "demo@realinvest.local" };
  const projectRows = mapProjects(projectFixtures, dashboardFixtures, marketTokenFixtures);
  const unitRows = mapUnits(unitFixtures);
  const stageRows = mapStages(stageFixtures, STAGES_PROJECT_ID);
  const purchaseOptionRows = mapPurchaseOptions(purchaseOptionFixtures);
  const storyRows = mapStories(storyFixtures);
  const marketTokenRows = [
    ...mapMarketTokens(marketTokenFixtures),
    ...synthesizeHoldingTokens(holdingFixtures, marketTokenFixtures, projectFixtures.map((p) => p.id)),
  ];
  const balanceRows = mapBalances(balanceFixtures, DEMO_USER_ID);
  const holdingRows = mapHoldings(holdingFixtures, DEMO_USER_ID);
  const positionRows = mapPositions(positionFixtures, DEMO_USER_ID);
  const transactionRows = mapTransactions(transactionFixtures, DEMO_USER_ID);
  const orderBookRows = mapOrderBooks(orderBookFixtures, marketTokenFixtures);

  const db = createDb();
  try {
    await db.run(sql`PRAGMA foreign_keys = ON`);
  } catch (error) {
    console.warn(`Could not enable foreign_keys pragma (target may not support it): ${String(error)}`);
  }

  await db.transaction(async (tx) => {
    await tx.delete(orderBookLevels);
    await tx.delete(transactions);
    await tx.delete(positions);
    await tx.delete(holdings);
    await tx.delete(balances);
    await tx.delete(sessions);
    await tx.delete(accounts);
    await tx.delete(users);
    await tx.delete(purchaseOptions);
    await tx.delete(projectStories);
    await tx.delete(stages);
    await tx.delete(marketTokens);
    await tx.delete(units);
    await tx.delete(projects);
    await tx.run(sql`DELETE FROM sqlite_sequence WHERE name IN ('order_book_levels', 'project_stories', 'stages')`);

    await tx.insert(users).values(demoUser);
    await tx.insert(projects).values(projectRows);
    await tx.insert(units).values(unitRows);
    await tx.insert(stages).values(stageRows);
    await tx.insert(purchaseOptions).values(purchaseOptionRows);
    await tx.insert(projectStories).values(storyRows);
    await tx.insert(marketTokens).values(marketTokenRows);
    await tx.insert(balances).values(balanceRows);
    await tx.insert(holdings).values(holdingRows);
    await tx.insert(positions).values(positionRows);
    await tx.insert(transactions).values(transactionRows);
    await tx.insert(orderBookLevels).values(orderBookRows);
  });

  const counts: [string, number][] = [
    ["users", 1],
    ["projects", projectRows.length],
    ["units", unitRows.length],
    ["stages", stageRows.length],
    ["purchase_options", purchaseOptionRows.length],
    ["project_stories", storyRows.length],
    ["market_tokens", marketTokenRows.length],
    ["balances", balanceRows.length],
    ["holdings", holdingRows.length],
    ["positions", positionRows.length],
    ["transactions", transactionRows.length],
    ["order_book_levels", orderBookRows.length],
  ];
  console.log(`Seeded ${process.env.DATABASE_URL ?? "file:./wallet.db"}:`);
  for (const [table, count] of counts) console.log(`  ${table}: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
