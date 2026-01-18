import { defineReactiveFunction } from '@agelum/backend'
import { z } from 'zod'
import { transactions as transactionsTable } from '../db/schema'

// Get all transactions
export const getAll = defineReactiveFunction({
  name: 'transactions.getAll',
  input: z.object({
    userId: z.string(),
    type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'DIVIDEND']).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    limit: z.number().optional().default(50),
  }),
  dependencies: ['transaction'],
  handler: async (input, db) => {
    return db.db.query.transactions.findMany({
      where: (transactions, { eq, and }) => {
        const conditions = [eq(transactions.userId, input.userId)]

        if (input.type) {
          conditions.push(eq(transactions.type, input.type))
        }

        if (input.status) {
          conditions.push(eq(transactions.status, input.status))
        }

        return and(...conditions)
      },
      orderBy: (transactions, { desc }) => [desc(transactions.createdAt)],
      limit: input.limit,
    })
  },
})

// Create a new transaction
export const create = defineReactiveFunction({
  name: 'transactions.create',
  input: z.object({
    userId: z.string(),
    type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'DIVIDEND']),
    currencyCode: z.enum(['USDT']),
    amount: z.number(),
    description: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
  dependencies: ['transaction'],
  handler: async (input, db) => {
    const result = await db.db.insert(transactionsTable).values({
      id: `txn-${Date.now()}`,
      userId: input.userId,
      type: input.type,
      status: 'PENDING',
      currencyCode: input.currencyCode,
      amount: input.amount,
      description: input.description,
      metadata: input.metadata,
      createdAt: new Date(),
    }).returning()

    return result[0]
  },
})
