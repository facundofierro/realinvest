import { defineReactiveFunction } from '@agelum/backend'
import { z } from 'zod'

// Get wallet balances
export const getBalances = defineReactiveFunction({
  name: 'wallet.balances.get',
  input: z.object({
    userId: z.string(),
  }),
  dependencies: ['wallet_balance'],
  handler: async (input, db) => {
    const balances = await db.db.query.walletBalances.findMany({
      where: (balances, { eq }) => eq(balances.userId, input.userId),
    })

    return balances.map((b) => ({
      currencyCode: b.currencyCode,
      available: b.available,
      locked: b.locked,
    }))
  },
})

// Get all holdings
export const getAllHoldings = defineReactiveFunction({
  name: 'wallet.holdings.getAll',
  input: z.object({
    userId: z.string(),
  }),
  dependencies: ['holding'],
  handler: async (input, db) => {
    return db.db.query.holdings.findMany({
      where: (holdings, { eq }) => eq(holdings.userId, input.userId),
    })
  },
})

// Get all positions
export const getAllPositions = defineReactiveFunction({
  name: 'wallet.positions.getAll',
  input: z.object({
    userId: z.string(),
    status: z.enum(['OPEN', 'PARTIALLY_FILLED', 'FILLED', 'CANCELLED']).optional(),
  }),
  dependencies: ['position'],
  handler: async (input, db) => {
    return db.db.query.positions.findMany({
      where: (positions, { eq, and }) => {
        const conditions = [eq(positions.userId, input.userId)]
        
        if (input.status) {
          conditions.push(eq(positions.status, input.status))
        }
        
        return and(...conditions)
      },
      orderBy: (positions, { desc }) => [desc(positions.createdAt)],
    })
  },
})
