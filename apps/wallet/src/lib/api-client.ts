// Client-safe API functions that fetch from API routes
// These can be safely imported in client components

import type {
  MarketToken,
  MarketOrderBook,
  MarketSeries,
  WalletBalance,
  Holding,
  Position,
  Transaction,
  Project,
  ProjectUnit,
  ProjectStory,
  ProjectStage,
  PurchaseOption,
} from "@/types/wallet";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// Market API
export async function getMarketTokens(): Promise<MarketToken[]> {
  const res = await fetch(`${API_BASE}/api/market/tokens`);
  if (!res.ok) throw new Error("Failed to fetch market tokens");
  const data = await res.json();
  return data.tokens || [];
}

export async function getMarketTokenBySymbol(symbol: string): Promise<MarketToken | null> {
  const tokens = await getMarketTokens();
  return tokens.find((t) => t.symbol === symbol) ?? null;
}

export async function getMarketSeries(
  symbol: string,
  timeframe: string,
  points: number
): Promise<MarketSeries> {
  const res = await fetch(`${API_BASE}/api/market/series?symbol=${symbol}&timeframe=${timeframe}&points=${points}`);
  if (!res.ok) throw new Error("Failed to fetch market series");
  return res.json();
}

export async function getMarketOrderBook(symbol: string): Promise<MarketOrderBook> {
  const res = await fetch(`${API_BASE}/api/market/orderbook?symbol=${symbol}`);
  if (!res.ok) throw new Error("Failed to fetch order book");
  const data = await res.json();
  return data.orderBook;
}

// Wallet API
export async function getWalletBalances(): Promise<WalletBalance[]> {
  const res = await fetch(`${API_BASE}/api/wallet/balances`);
  if (!res.ok) throw new Error("Failed to fetch wallet balances");
  const data = await res.json();
  return data.balances || [];
}

export async function getWalletHoldings(): Promise<Holding[]> {
  const res = await fetch(`${API_BASE}/api/wallet/holdings`);
  if (!res.ok) throw new Error("Failed to fetch holdings");
  const data = await res.json();
  return data.holdings || [];
}

export async function getWalletPositions(): Promise<Position[]> {
  const res = await fetch(`${API_BASE}/api/wallet/positions`);
  if (!res.ok) throw new Error("Failed to fetch positions");
  const data = await res.json();
  return data.positions || [];
}

export async function createPosition(position: {
  tokenSymbol: string;
  side: "BUY" | "SELL";
  orderType: "MARKET" | "LIMIT";
  totalAmount: number;
  orderPriceUsd?: number;
}): Promise<Position> {
  const res = await fetch(`${API_BASE}/api/wallet/positions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(position),
  });
  if (!res.ok) throw new Error("Failed to create position");
  const data = await res.json();
  return data.position;
}

// Projects API
export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const data = await res.json();
  return data.projects || [];
}

export async function getProjectById(id: string): Promise<Project | null> {
  const res = await fetch(`${API_BASE}/api/projects/${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.project;
}

export async function getProjectUnits(projectId: string): Promise<ProjectUnit[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/units`);
  if (!res.ok) throw new Error("Failed to fetch project units");
  const data = await res.json();
  return data.units || [];
}

export async function getProjectStories(projectId: string): Promise<ProjectStory[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/stories`);
  if (!res.ok) throw new Error("Failed to fetch project stories");
  const data = await res.json();
  return data.stories || [];
}

export async function getProjectStages(projectId: string): Promise<ProjectStage[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/stages`);
  if (!res.ok) throw new Error("Failed to fetch project stages");
  const data = await res.json();
  return data.stages || [];
}

export async function getProjectPurchaseOptions(projectId: string): Promise<PurchaseOption[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/purchase-options`);
  if (!res.ok) throw new Error("Failed to fetch purchase options");
  const data = await res.json();
  return data.options || [];
}

// Dashboard API
export async function getDashboardProjects(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/api/dashboard/projects`);
  if (!res.ok) throw new Error("Failed to fetch dashboard projects");
  const data = await res.json();
  return data.projects || [];
}

// Transactions API
export async function getTransactions(): Promise<Transaction[]> {
  const res = await fetch(`${API_BASE}/api/transactions`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  const data = await res.json();
  return data.transactions || [];
}
