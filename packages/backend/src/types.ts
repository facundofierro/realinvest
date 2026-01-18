// Shared types that match the wallet app types
export type CurrencyCode = 'USDT'

export interface MoneyAmount {
  currencyCode: CurrencyCode
  amount: number
}

export type ProjectStatus = 'PRE_SALE' | 'IN_CONSTRUCTION' | 'COMPLETED'

export type PositionSide = 'BUY' | 'SELL'
export type PositionStatus = 'OPEN' | 'PARTIALLY_FILLED' | 'FILLED' | 'CANCELLED'

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BUY' | 'SELL' | 'DIVIDEND'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export type Timeframe = 'all' | '30d' | '7d' | '24h'
