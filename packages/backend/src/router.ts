import { createReactiveRouter } from '@agelum/backend'
import { db } from './db'
import * as projects from './functions/projects'
import * as market from './functions/market'
import * as wallet from './functions/wallet'
import * as transactions from './functions/transactions'

// Create the main tRPC router with all reactive functions
export const appRouter = createReactiveRouter({ db })
  // Projects queries
  .addQuery(projects.getAllProjects)
  .addQuery(projects.getProjectById)
  .addQuery(projects.getAllDashboardProjects)
  .addQuery(projects.getAllUnits)
  .addQuery(projects.getAllStories)
  .addQuery(projects.getAllStages)
  .addQuery(projects.getAllPurchaseOptions)
  // Market queries
  .addQuery(market.getAllTokens)
  .addQuery(market.getOrderbook)
  .addQuery(market.getSeries)
  // Wallet queries
  .addQuery(wallet.getBalances)
  .addQuery(wallet.getAllHoldings)
  .addQuery(wallet.getAllPositions)
  // Transactions queries
  .addQuery(transactions.getAll)
  // Transactions mutations
  .addMutation(transactions.create)
  .build()

// Export the router type for use in the frontend
export type AppRouter = typeof appRouter
