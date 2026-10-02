"use client";

import { trpc } from "@/lib/trpc";
import type { TransactionStatus, TransactionType } from "@repo/db";

// Admin dashboard stats
export function useAdminDashboardStats() {
  return trpc.admin.dashboard.stats.useQuery({});
}

// All projects for admin
export function useAllProjects() {
  return trpc.projects.getAll.useQuery({});
}

// All transactions across platform
export function useAllTransactions(filters?: {
  type?: TransactionType;
  status?: TransactionStatus;
  userId?: string;
}) {
  return trpc.admin.transactions.getAll.useQuery(filters || {});
}

// Property statistics
export function usePropertyStatistics() {
  return trpc.admin.properties.statistics.useQuery({});
}
