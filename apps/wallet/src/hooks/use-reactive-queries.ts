import { useReactive } from '@agelum/backend/client'

const DEFAULT_USER_ID = 'default-user'

// Projects hooks
export function useProjects(status?: 'PRE_SALE' | 'IN_CONSTRUCTION' | 'COMPLETED') {
  return useReactive('projects.getAll', { status })
}

export function useProjectById(id: string) {
  return useReactive('projects.getById', { id })
}

export function useDashboardProjects() {
  return useReactive('projects.dashboard.getAll', {})
}

export function useProjectUnits(projectId: string) {
  return useReactive('projects.units.getAll', { projectId })
}

export function useProjectStories(projectId: string) {
  return useReactive('projects.stories.getAll', { projectId })
}

export function useProjectStages(projectId: string) {
  return useReactive('projects.stages.getAll', { projectId })
}

export function useProjectPurchaseOptions(projectId: string) {
  return useReactive('projects.purchaseOptions.getAll', { projectId })
}

// Market hooks
export function useMarketTokens(options?: { projectId?: string; isFavorite?: boolean }) {
  return useReactive('market.tokens.getAll', options || {})
}

export function useOrderbook(symbol: string) {
  return useReactive('market.orderbook.get', { symbol })
}

export function useMarketSeries(symbol: string, timeframe?: 'all' | '30d' | '7d' | '24h') {
  return useReactive('market.series.get', { symbol, timeframe })
}

// Wallet hooks
export function useWalletBalances() {
  return useReactive('wallet.balances.get', { userId: DEFAULT_USER_ID })
}

export function useHoldings() {
  return useReactive('wallet.holdings.getAll', { userId: DEFAULT_USER_ID })
}

export function usePositions(status?: 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED') {
  return useReactive('wallet.positions.getAll', { userId: DEFAULT_USER_ID, status })
}

// Transactions hooks
export function useTransactions(options?: {
  type?: 'DEPOSIT' | 'WITHDRAWAL' | 'BUY' | 'SELL' | 'DIVIDEND'
  status?: 'PENDING' | 'COMPLETED' | 'FAILED'
  limit?: number
}) {
  return useReactive('transactions.getAll', {
    userId: DEFAULT_USER_ID,
    ...options,
  })
}
