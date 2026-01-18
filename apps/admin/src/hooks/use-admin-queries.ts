"use client";

import { trpc } from "@/lib/trpc";

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
  type?: string;
  status?: string;
  userId?: string;
}) {
  return trpc.admin.transactions.getAll.useQuery(filters || {});
}

// Property statistics
export function usePropertyStatistics() {
  return trpc.admin.properties.statistics.useQuery({});
}
