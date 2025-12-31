"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "@/lib/api-client";

// Market
export function useMarketTokens() {
  return useQuery({
    queryKey: ["market", "tokens"],
    queryFn: api.getMarketTokens,
  });
}

export function useMarketToken(symbol: string) {
  return useQuery({
    queryKey: ["market", "tokens", symbol],
    queryFn: () => api.getMarketTokenBySymbol(symbol),
    enabled: !!symbol,
  });
}

export function useMarketOrderBook(symbol: string) {
  return useQuery({
    queryKey: ["market", "orderbook", symbol],
    queryFn: () => api.getMarketOrderBook(symbol),
    enabled: !!symbol,
    refetchInterval: 5000,
  });
}

export function useMarketSeries(symbol: string, timeframe: string, points: number) {
  return useQuery({
    queryKey: ["market", "series", symbol, timeframe],
    queryFn: () => api.getMarketSeries(symbol, timeframe, points),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Wallet
export function useWalletBalances() {
  return useQuery({
    queryKey: ["wallet", "balances"],
    queryFn: api.getWalletBalances,
  });
}

export function useWalletHoldings() {
  return useQuery({
    queryKey: ["wallet", "holdings"],
    queryFn: api.getWalletHoldings,
  });
}

export function useWalletPositions() {
  return useQuery({
    queryKey: ["wallet", "positions"],
    queryFn: api.getWalletPositions,
    refetchInterval: 10000,
  });
}

export function useTransactions() {
  return useQuery({
    queryKey: ["wallet", "transactions"],
    queryFn: api.getTransactions,
  });
}

// Projects
export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: api.getProjects,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => api.getProjectById(id),
    enabled: !!id,
  });
}

export function useProjectStories(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "stories"],
    queryFn: () => api.getProjectStories(projectId),
    enabled: !!projectId,
  });
}

export function useProjectStages(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "stages"],
    queryFn: () => api.getProjectStages(projectId),
    enabled: !!projectId,
  });
}

export function useProjectPurchaseOptions(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "purchase-options"],
    queryFn: () => api.getProjectPurchaseOptions(projectId),
    enabled: !!projectId,
  });
}

export function useProjectUnits(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "units"],
    queryFn: () => api.getProjectUnits(projectId),
    enabled: !!projectId,
  });
}

export function useDashboardProjects() {
  return useQuery({
    queryKey: ["dashboard", "projects"],
    queryFn: api.getDashboardProjects,
  });
}

// Mutations
export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
    },
  });
}

export function useClosePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.closePosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
    },
  });
}
