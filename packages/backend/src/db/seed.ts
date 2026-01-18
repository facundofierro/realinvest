import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import {
  projects,
  projectUnits,
  projectStories,
  projectStages,
  projectPurchaseOptions,
  marketTokens,
  walletBalances,
  holdings,
  positions,
  transactions,
  orderbookLevels,
} from './schema'

// Sample data imports
import projectsData from '../../../apps/wallet/src/sample-data/projects.json'
import unitsData from '../../../apps/wallet/src/sample-data/projectUnits.json'
import storiesData from '../../../apps/wallet/src/sample-data/projectStories.json'
import stagesData from '../../../apps/wallet/src/sample-data/projectStages.json'
import purchaseOptionsData from '../../../apps/wallet/src/sample-data/projectPurchaseOptions.json'
import tokensData from '../../../apps/wallet/src/sample-data/marketTokens.json'
import balancesData from '../../../apps/wallet/src/sample-data/walletBalances.json'
import holdingsData from '../../../apps/wallet/src/sample-data/walletHoldings.json'
import positionsData from '../../../apps/wallet/src/sample-data/walletPositions.json'
import transactionsData from '../../../apps/wallet/src/sample-data/transactions.json'
import orderbookData from '../../../apps/wallet/src/sample-data/marketOrderBooks.json'

const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/vest'
const client = postgres(connectionString)
const db = drizzle(client, { schema })

const DEFAULT_USER_ID = 'default-user'

async function seed() {
  console.log('Starting database seed...')

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('Clearing existing data...')
    await db.delete(orderbookLevels)
    await db.delete(transactions)
    await db.delete(positions)
    await db.delete(holdings)
    await db.delete(walletBalances)
    await db.delete(marketTokens)
    await db.delete(projectPurchaseOptions)
    await db.delete(projectStages)
    await db.delete(projectStories)
    await db.delete(projectUnits)
    await db.delete(projects)

    // Seed projects
    console.log('Seeding projects...')
    await db.insert(projects).values(projectsData as any)

    // Seed project units
    console.log('Seeding project units...')
    await db.insert(projectUnits).values(unitsData as any)

    // Seed project stories
    console.log('Seeding project stories...')
    const storiesWithProjects = storiesData.map((story: any) => ({
      ...story,
      projectId: projectsData[0].id, // Associate with first project
    }))
    await db.insert(projectStories).values(storiesWithProjects as any)

    // Seed project stages
    console.log('Seeding project stages...')
    const stagesWithProjects = stagesData.map((stage: any) => ({
      ...stage,
      projectId: projectsData[0].id, // Associate with first project
    }))
    await db.insert(projectStages).values(stagesWithProjects as any)

    // Seed project purchase options
    console.log('Seeding project purchase options...')
    await db.insert(projectPurchaseOptions).values(purchaseOptionsData as any)

    // Seed market tokens
    console.log('Seeding market tokens...')
    await db.insert(marketTokens).values(tokensData as any)

    // Seed wallet balances
    console.log('Seeding wallet balances...')
    const balancesWithUser = balancesData.map((balance: any) => ({
      ...balance,
      userId: DEFAULT_USER_ID,
    }))
    await db.insert(walletBalances).values(balancesWithUser as any)

    // Seed holdings
    console.log('Seeding holdings...')
    const holdingsWithUser = holdingsData.map((holding: any) => ({
      ...holding,
      userId: DEFAULT_USER_ID,
    }))
    await db.insert(holdings).values(holdingsWithUser as any)

    // Seed positions
    console.log('Seeding positions...')
    const positionsWithUser = positionsData.map((position: any) => ({
      ...position,
      userId: DEFAULT_USER_ID,
    }))
    await db.insert(positions).values(positionsWithUser as any)

    // Seed transactions
    console.log('Seeding transactions...')
    const transactionsWithUser = transactionsData.map((transaction: any) => ({
      id: transaction.id,
      userId: DEFAULT_USER_ID,
      type: transaction.type,
      status: transaction.status,
      createdAt: new Date(transaction.createdAt),
      currencyCode: transaction.amount.currencyCode,
      amount: transaction.amount.amount,
      description: transaction.description,
      metadata: transaction.metadata,
    }))
    await db.insert(transactions).values(transactionsWithUser as any)

    // Seed orderbook levels
    console.log('Seeding orderbook levels...')
    const orderbookLevelsData: any[] = []

    for (const [symbol, orderbook] of Object.entries(orderbookData) as [string, any][]) {
      // Find the token
      const token = tokensData.find((t: any) => t.symbol === symbol)
      if (!token) continue

      // Add asks (SELL orders)
      for (const ask of orderbook.asks) {
        orderbookLevelsData.push({
          tokenId: token.id,
          side: 'SELL',
          price: ask.price,
          amount: ask.amount,
        })
      }

      // Add bids (BUY orders)
      for (const bid of orderbook.bids) {
        orderbookLevelsData.push({
          tokenId: token.id,
          side: 'BUY',
          price: bid.price,
          amount: bid.amount,
        })
      }
    }

    if (orderbookLevelsData.length > 0) {
      await db.insert(orderbookLevels).values(orderbookLevelsData)
    }

    console.log('Database seed completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await client.end()
  }
}

seed()
