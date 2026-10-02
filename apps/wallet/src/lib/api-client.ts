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
  ProjectPurchaseOption,
} from "@/types/wallet";
import type { DashboardProject } from "@/lib/api/dashboard-projects";
import type { KycApplication, KycSubmissionInput } from "@repo/providers-kyc";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "";

import { getNativeAccessToken, refreshNativeAccessToken } from "@/lib/session";

async function fetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = getNativeAccessToken();
  const request = token ? {
    ...init,
    credentials: "omit" as RequestCredentials,
    headers: { ...Object.fromEntries(new Headers(init?.headers).entries()), Authorization: `Bearer ${token}` },
  } : init;
  let response = await globalThis.fetch(input, request);
  if (response.status === 401 && token && await refreshNativeAccessToken()) {
    const refreshedToken = getNativeAccessToken();
    response = await globalThis.fetch(input, { ...init, credentials: "omit", headers: { ...Object.fromEntries(new Headers(init?.headers).entries()), Authorization: `Bearer ${refreshedToken}` } });
  }
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.assign("/login");
  }
  return response;
}

export function getApiUrl(
  path: string
): string {
  const normalizedPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  if (!API_BASE) return normalizedPath;

  const base = API_BASE.trim();
  const withoutTrailingSlashes =
    base.endsWith("/")
      ? base.replace(/\/+$/, "")
      : base;

  try {
    const url = new URL(
      withoutTrailingSlashes
    );
    return new URL(
      normalizedPath,
      url.origin
    ).toString();
  } catch {
    return `${withoutTrailingSlashes}${normalizedPath}`;
  }
}

// Market API
export async function getMarketTokens(): Promise<
  MarketToken[]
> {
  const res = await fetch(
    getApiUrl("/api/market/tokens")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch market tokens"
    );
  const data = await res.json();
  return data.tokens || [];
}

export async function getMarketTokenBySymbol(
  symbol: string
): Promise<MarketToken | null> {
  const tokens =
    await getMarketTokens();
  return (
    tokens.find(
      (t) => t.symbol === symbol
    ) ?? null
  );
}

export async function getMarketSeries(
  symbol: string,
  timeframe: string,
  points: number
): Promise<MarketSeries> {
  const res = await fetch(
    getApiUrl(
      `/api/market/series?symbol=${encodeURIComponent(symbol)}&timeframe=${encodeURIComponent(timeframe)}&points=${points}`
    )
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch market series"
    );
  return res.json();
}

export async function getMarketOrderBook(
  symbol: string
): Promise<MarketOrderBook> {
  const res = await fetch(
    getApiUrl(
      `/api/market/orderbook?symbol=${encodeURIComponent(symbol)}`
    )
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch order book"
    );
  const data = await res.json();
  if (
    data &&
    typeof data === "object" &&
    "orderBook" in data
  ) {
    return (
      data as {
        orderBook: MarketOrderBook;
      }
    ).orderBook;
  }
  return data as MarketOrderBook;
}

// Wallet API
export async function getWalletBalances(): Promise<
  WalletBalance[]
> {
  const res = await fetch(
    getApiUrl("/api/wallet/balances")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch wallet balances"
    );
  const data = await res.json();
  return data.balances || [];
}

export async function getWalletHoldings(): Promise<
  Holding[]
> {
  const res = await fetch(
    getApiUrl("/api/wallet/holdings")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch holdings"
    );
  const data = await res.json();
  return data.holdings || [];
}

export async function getWalletPositions(): Promise<
  Position[]
> {
  const res = await fetch(
    getApiUrl("/api/wallet/positions")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch positions"
    );
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
  const res = await fetch(
    getApiUrl("/api/wallet/positions"),
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(position),
    }
  );
  if (!res.ok)
    throw new Error(
      "Failed to create position"
    );
  const data = await res.json();
  return data.position;
}

export type WalletApiError = Error & { code?: string; status?: string; rejectionReason?: string | null };

async function walletApiError(res: Response, fallback: string): Promise<WalletApiError> {
  const body = await res.json().catch(() => null);
  const error = new Error(body?.error ?? fallback) as WalletApiError;
  error.code = body?.code;
  error.status = body?.status;
  error.rejectionReason = body?.rejectionReason;
  return error;
}

export async function createWithdrawal(input: { amount: number; address: string }): Promise<Transaction> {
  const res = await fetch(getApiUrl("/api/wallet/withdraw"), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input),
  });
  if (!res.ok) throw await walletApiError(res, "Failed to create withdrawal");
  return (await res.json()).transaction;
}

export async function purchaseUnitTokens(projectId: string, input: { unitId: string; tokenAmount: number }): Promise<Transaction> {
  const res = await fetch(getApiUrl(`/api/projects/${projectId}/units/${input.unitId}/purchase`), {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tokenAmount: input.tokenAmount }),
  });
  if (!res.ok) throw await walletApiError(res, "Purchase failed");
  return (await res.json()).transaction;
}

export async function getDepositAddress(): Promise<{ address: string; network: string; assetId: string; qrValue: string }> {
  const res = await fetch(getApiUrl("/api/wallet/deposit"));
  if (!res.ok) {
    const error = await walletApiError(res, "Failed to fetch deposit address");
    if (error.message === "kyc_required") error.message = "kyc_required";
    throw error;
  }
  return res.json();
}

export async function simulateDeposit(): Promise<Transaction> {
  const res = await fetch(getApiUrl("/api/wallet/deposit"), { method: "POST" });
  if (!res.ok) throw await walletApiError(res, "Failed to simulate deposit");
  return (await res.json()).transaction;
}

export async function closePosition(positionId: string): Promise<void> {
  const res = await fetch(getApiUrl(`/api/wallet/positions/${positionId}/cancel`), { method: "POST" });
  if (!res.ok) throw await walletApiError(res, "Failed to cancel order");
}

// Projects API
export async function getProjects(): Promise<
  Project[]
> {
  const res = await fetch(
    getApiUrl("/api/projects")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch projects"
    );
  const data = await res.json();
  return data.projects || [];
}

export async function getProjectById(
  id: string
): Promise<Project | null> {
  const res = await fetch(
    getApiUrl(`/api/projects/${id}`)
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.project;
}

export async function getProjectUnits(
  projectId: string
): Promise<ProjectUnit[]> {
  const res = await fetch(
    getApiUrl(
      `/api/projects/${projectId}/units`
    )
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch project units"
    );
  const data = await res.json();
  return data.units || [];
}

export async function getProjectStories(
  projectId: string
): Promise<ProjectStory[]> {
  const res = await fetch(
    getApiUrl(
      `/api/projects/${projectId}/stories`
    )
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch project stories"
    );
  const data = await res.json();
  return data.stories || [];
}

export async function getProjectStages(
  projectId: string
): Promise<ProjectStage[]> {
  const res = await fetch(
    getApiUrl(
      `/api/projects/${projectId}/stages`
    )
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch project stages"
    );
  const data = await res.json();
  return data.stages || [];
}

export async function getProjectPurchaseOptions(
  projectId: string
): Promise<ProjectPurchaseOption[]> {
  const res = await fetch(
    getApiUrl(
      `/api/projects/${projectId}/purchase-options`
    )
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch purchase options"
    );
  const data = await res.json();
  return data.options || [];
}

// Dashboard API
export async function getDashboardProjects(): Promise<
  DashboardProject[]
> {
  const res = await fetch(
    getApiUrl("/api/dashboard/projects")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch dashboard projects"
    );
  const data = await res.json();
  return data.projects || [];
}

// Transactions API
export async function getTransactions(): Promise<
  Transaction[]
> {
  const res = await fetch(
    getApiUrl("/api/transactions")
  );
  if (!res.ok)
    throw new Error(
      "Failed to fetch transactions"
    );
  const data = await res.json();
  return data.transactions || [];
}

// KYC API
export async function getKycApplication(): Promise<KycApplication | null> {
  const res = await fetch(getApiUrl("/api/kyc"));
  if (!res.ok) throw new Error("Failed to fetch KYC application");
  const data = await res.json();
  return data.application ?? null;
}

export async function submitKyc(input: KycSubmissionInput): Promise<KycApplication> {
  const res = await fetch(getApiUrl("/api/kyc"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to submit KYC application");
  return (await res.json()).application;
}
