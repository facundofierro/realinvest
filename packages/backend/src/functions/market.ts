import { defineReactiveFunction } from '@agelum/backend'
import { z } from 'zod'

// Get all market tokens
export const getAllTokens = defineReactiveFunction({
  name: 'market.tokens.getAll',
  input: z.object({
    projectId: z.string().optional(),
    isFavorite: z.boolean().optional(),
  }),
  dependencies: ['market_token'],
  handler: async (input, db) => {
    return db.db.query.marketTokens.findMany({
      where: (tokens, { eq, and }) => {
        const conditions = []

        if (input.projectId) {
          conditions.push(eq(tokens.projectId, input.projectId))
        }

        if (input.isFavorite !== undefined) {
          conditions.push(eq(tokens.isFavorite, input.isFavorite))
        }

        return conditions.length > 0 ? and(...conditions) : undefined
      },
    })
  },
})

// Get orderbook for a token
export const getOrderbook = defineReactiveFunction({
  name: 'market.orderbook.get',
  input: z.object({
    symbol: z.string(),
  }),
  dependencies: ['orderbook_level'],
  handler: async (input, db) => {
    // First get the token
    const token = await db.db.query.marketTokens.findFirst({
      where: (tokens, { eq }) => eq(tokens.symbol, input.symbol),
    })

    if (!token) {
      return { asks: [], bids: [] }
    }

    // Get all orderbook levels for this token
    const levels = await db.db.query.orderbookLevels.findMany({
      where: (levels, { eq }) => eq(levels.tokenId, token.id),
    })

    // Separate into asks (SELL) and bids (BUY)
    const asks = levels
      .filter((l) => l.side === 'SELL')
      .map((l) => ({ price: l.price, amount: l.amount }))
      .sort((a, b) => a.price - b.price)

    const bids = levels
      .filter((l) => l.side === 'BUY')
      .map((l) => ({ price: l.price, amount: l.amount }))
      .sort((a, b) => b.price - a.price)

    return { asks, bids }
  },
})

// Get market series for a token
export const getSeries = defineReactiveFunction({
  name: 'market.series.get',
  input: z.object({
    symbol: z.string(),
    timeframe: z.enum(['all', '30d', '7d', '24h']).optional().default('7d'),
  }),
  dependencies: ['market_series'],
  handler: async (input, db) => {
    // First get the token
    const token = await db.db.query.marketTokens.findFirst({
      where: (tokens, { eq }) => eq(tokens.symbol, input.symbol),
    })

    if (!token) {
      return { series: [] }
    }

    // Calculate date filter based on timeframe
    const now = new Date()
    let dateFilter: Date | null = null

    switch (input.timeframe) {
      case '24h':
        dateFilter = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        break
      case '7d':
        dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case 'all':
      default:
        dateFilter = null
        break
    }

    // Get series data
    const seriesData = await db.db.query.marketSeries.findMany({
      where: (series, { eq, and, gte }) => {
        const conditions = [eq(series.tokenId, token.id)]

        if (dateFilter) {
          conditions.push(gte(series.timestamp, dateFilter))
        }

        return and(...conditions)
      },
      orderBy: (series, { asc }) => [asc(series.timestamp)],
    })

    return {
      series: seriesData.map((s) => s.price),
    }
  },
})
