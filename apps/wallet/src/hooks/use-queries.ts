"use client";

import { useReactive } from "@agelum/backend/client";

const DEFAULT_USER_ID = "default-user";

// Market
export function useMarketTokens() {
  return useReactive("market.tokens.getAll", {});
}

export function useMarketToken(symbol: string) {
  const { data: tokens, ...rest } = useReactive("market.tokens.getAll", {});
  const token = tokens?.find((t) => t.symbol === symbol);
  return { data: token, ...rest };
}

export function useMarketOrderBook(symbol: string) {
  return useReactive("market.orderbook.get", { symbol });
}

export function useMarketSeries(
  symbol: string,
  timeframe: "all" | "30d" | "7d" | "24h",
  _points?: number
) {
  return useReactive("market.series.get", { symbol, timeframe });
}

// Wallet
export function useWalletBalances() {
  return useReactive("wallet.balances.get", { userId: DEFAULT_USER_ID });
}

export function useWalletHoldings() {
  return useReactive("wallet.holdings.getAll", { userId: DEFAULT_USER_ID });
}

export function useWalletPositions() {
  return useReactive("wallet.positions.getAll", { userId: DEFAULT_USER_ID });
}

export function useTransactions() {
  return useReactive("transactions.getAll", { userId: DEFAULT_USER_ID });
}

// Projects
export function useProjects() {
  return useReactive("projects.getAll", {});
}

export function useProject(id: string) {
  return useReactive("projects.getById", { id });
}

export function useProjectStories(projectId: string) {
  return useReactive("projects.stories.getAll", { projectId });
}

export function useProjectStages(projectId: string) {
  return useReactive("projects.stages.getAll", { projectId });
}

export function useProjectPurchaseOptions(projectId: string) {
  return useReactive("projects.purchaseOptions.getAll", { projectId });
}

export function useProjectUnits(projectId: string) {
  return useReactive("projects.units.getAll", { projectId });
}

export function useDashboardProjects() {
  return useReactive("projects.dashboard.getAll", {});
}

// Mutations - these will auto-invalidate via SSE
// For now, return empty mutation functions for compatibility
export function useCreatePosition() {
  return {
    mutate: () => {
      console.warn("useCreatePosition not yet implemented with tRPC mutations");
    },
    mutateAsync: async () => {
      console.warn("useCreatePosition not yet implemented with tRPC mutations");
    },
  };
}

export function useClosePosition() {
  return {
    mutate: () => {
      console.warn("useClosePosition not yet implemented with tRPC mutations");
    },
    mutateAsync: async () => {
      console.warn("useClosePosition not yet implemented with tRPC mutations");
    },
  };
}
