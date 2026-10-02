"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closePosition,
  createPosition,
  createWithdrawal,
  purchaseUnitTokens,
  simulateDeposit,
  getDepositAddress,
  getDashboardProjects,
  getKycApplication,
  getMarketOrderBook,
  getMarketSeries,
  getMarketTokens,
  getProjectById,
  getProjectPurchaseOptions,
  getProjects,
  getProjectStages,
  getProjectStories,
  getProjectUnits,
  getTransactions,
  getWalletBalances,
  getWalletHoldings,
  getWalletPositions,
  submitKyc,
} from "@/lib/api-client";
import type { KycSubmissionInput } from "@repo/providers-kyc";

// Market
export function useMarketTokens() {
  return useQuery({ queryKey: ["market", "tokens"], queryFn: getMarketTokens });
}

export function useMarketToken(symbol: string) {
  const { data: tokens, ...rest } = useMarketTokens();
  const token = tokens?.find((t) => t.symbol === symbol);
  return { data: token, ...rest };
}

export function useMarketOrderBook(symbol: string) {
  return useQuery({
    queryKey: ["market", "orderbook", symbol],
    queryFn: () => getMarketOrderBook(symbol),
  });
}

export function useMarketSeries(
  symbol: string,
  timeframe: "all" | "30d" | "7d" | "24h",
  points = 30,
) {
  return useQuery({
    queryKey: ["market", "series", symbol, timeframe, points],
    queryFn: () => getMarketSeries(symbol, timeframe, points),
  });
}

// Wallet
export function useWalletBalances() {
  return useQuery({
    queryKey: ["wallet", "balances"],
    queryFn: getWalletBalances,
    refetchInterval: 3000,
  });
}

export function useWalletHoldings() {
  return useQuery({
    queryKey: ["wallet", "holdings"],
    queryFn: getWalletHoldings,
  });
}

export function useWalletPositions() {
  return useQuery({
    queryKey: ["wallet", "positions"],
    queryFn: getWalletPositions,
  });
}

export function useTransactions() {
  return useQuery({ queryKey: ["transactions"], queryFn: getTransactions, refetchInterval: 3000 });
}

// Projects
export function useProjects() {
  return useQuery({ queryKey: ["projects"], queryFn: getProjects });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: () => getProjectById(id),
  });
}

export function useProjectStories(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "stories"],
    queryFn: () => getProjectStories(projectId),
  });
}

export function useProjectStages(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "stages"],
    queryFn: () => getProjectStages(projectId),
  });
}

export function useProjectPurchaseOptions(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "purchaseOptions"],
    queryFn: () => getProjectPurchaseOptions(projectId),
  });
}

export function useProjectUnits(projectId: string) {
  return useQuery({
    queryKey: ["projects", projectId, "units"],
    queryFn: () => getProjectUnits(projectId),
  });
}

export function useDashboardProjects() {
  return useQuery({
    queryKey: ["dashboard", "projects"],
    queryFn: getDashboardProjects,
  });
}

export function useCreatePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useClosePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closePosition,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] }),
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWithdrawal,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
    },
  });
}

export function useInvestPurchase(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { unitId: string; tokenAmount: number }) => purchaseUnitTokens(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet", "positions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "holdings"] });
      queryClient.invalidateQueries({ queryKey: ["market", "tokens"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "units"] });
    },
  });
}

export function useDepositAddress() {
  return useQuery({ queryKey: ["wallet", "deposit-address"], queryFn: getDepositAddress, retry: false });
}

export function useSimulateDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: simulateDeposit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["wallet", "balances"] });
    },
  });
}

const KYC_QUERY_KEY = ["kyc", "application"] as const;

export function useKycApplication() {
  return useQuery({
    queryKey: KYC_QUERY_KEY,
    queryFn: getKycApplication,
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 3000 : false,
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KycSubmissionInput) => submitKyc(input),
    onSuccess: (application) =>
      queryClient.setQueryData(KYC_QUERY_KEY, application),
  });
}
