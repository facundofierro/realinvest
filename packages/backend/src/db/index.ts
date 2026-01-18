import { createReactiveDb } from '@agelum/backend'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Create postgres connection
const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/vest'
const client = postgres(connectionString)

// Create drizzle instance
const drizzleDb = drizzle(client, { schema })

// Create reactive database with table relations
export const db = createReactiveDb(drizzleDb, {
  relations: {
    // When projects table changes, invalidate these tables
    project: ['project_unit', 'project_story', 'project_stage', 'project_purchase_option', 'market_token'],

    // When project_units table changes, invalidate these tables
    project_unit: ['project', 'market_token'],

    // When project stories change
    project_story: ['project'],

    // When project stages change
    project_stage: ['project'],

    // When project purchase options change
    project_purchase_option: ['project'],

    // When market_tokens table changes, invalidate these tables
    market_token: ['project', 'project_unit', 'holding', 'position', 'orderbook_level', 'market_series'],

    // When holdings table changes
    holding: ['market_token'],

    // When positions table changes
    position: ['market_token', 'transaction'],

    // When transactions table changes
    transaction: ['position', 'wallet_balance'],

    // When wallet balances change
    wallet_balance: ['transaction'],

    // When orderbook levels change
    orderbook_level: ['market_token'],

    // When market series change
    market_series: ['market_token'],
  },
})

// Export schema for use in queries
export { schema }
