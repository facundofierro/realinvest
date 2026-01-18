import { defineReactiveFunction } from '@agelum/backend'
import { z } from 'zod'
import { sql, eq, desc, and } from 'drizzle-orm'

// Get admin dashboard statistics
export const getAdminDashboardStats = defineReactiveFunction({
  name: 'admin.dashboard.stats',
  input: z.object({}),
  dependencies: ['wallet_balance', 'market_token', 'transaction', 'project'],
  handler: async (input, db) => {
    const { walletBalances, marketTokens, transactions, projects } = db.db._.schema!

    // Get total liquidity (sum of all wallet balances)
    const liquidityResult = await db.db
      .select({
        total: sql<number>`COALESCE(SUM(${walletBalances.available}), 0)`,
      })
      .from(walletBalances)

    // Get total token market cap
    const marketCapResult = await db.db
      .select({
        total: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
      })
      .from(marketTokens)

    // Get total projects count
    const projectsResult = await db.db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(projects)

    // Get total transactions count
    const transactionsResult = await db.db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(transactions)

    // Get most valuable property (highest market cap)
    const mostValuableProperty = await db.db
      .select({
        id: projects.id,
        title: projects.title,
        value: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
      })
      .from(projects)
      .leftJoin(marketTokens, eq(projects.id, marketTokens.projectId))
      .groupBy(projects.id, projects.title)
      .orderBy(desc(sql`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`))
      .limit(1)

    // Get highest ROI property
    const highestRoiProperty = await db.db
      .select({
        id: projects.id,
        title: projects.title,
        roi: projects.roiPct,
      })
      .from(projects)
      .orderBy(desc(projects.roiPct))
      .limit(1)

    return {
      totalLiquidity: liquidityResult[0]?.total || 0,
      totalTokenMarketCap: marketCapResult[0]?.total || 0,
      totalProperties: Number(projectsResult[0]?.count || 0),
      totalTransactions: Number(transactionsResult[0]?.count || 0),
      mostValuableProperty: mostValuableProperty[0] || null,
      highestRoiProperty: highestRoiProperty[0] || null,
    }
  },
})

// Get property statistics
export const getPropertyStatistics = defineReactiveFunction({
  name: 'admin.properties.statistics',
  input: z.object({}),
  dependencies: ['project', 'market_token', 'transaction'],
  handler: async (input, db) => {
    const { projects, marketTokens, transactions } = db.db._.schema!

    const stats = await db.db
      .select({
        projectId: projects.id,
        projectTitle: projects.title,
        totalValue: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
        tokenCount: sql<number>`COUNT(${marketTokens.id})`,
      })
      .from(projects)
      .leftJoin(marketTokens, eq(projects.id, marketTokens.projectId))
      .groupBy(projects.id, projects.title)
      .orderBy(desc(sql`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`))

    return stats
  },
})

// Get all transactions with filters
export const getAllTransactions = defineReactiveFunction({
  name: 'admin.transactions.getAll',
  input: z.object({
    type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'BUY', 'SELL', 'DIVIDEND']).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'FAILED']).optional(),
    userId: z.string().optional(),
    limit: z.number().optional().default(100),
  }),
  dependencies: ['transaction'],
  handler: async (input, db) => {
    const { transactions } = db.db._.schema!

    let query = db.db.select().from(transactions)

    // Apply filters
    const conditions = []
    if (input.type) {
      conditions.push(eq(transactions.type, input.type))
    }
    if (input.status) {
      conditions.push(eq(transactions.status, input.status))
    }
    if (input.userId) {
      conditions.push(eq(transactions.userId, input.userId))
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any
    }

    const result = await query
      .orderBy(desc(transactions.createdAt))
      .limit(input.limit)

    return result
  },
})

// Create a new property
export const createProperty = defineReactiveFunction({
  name: 'admin.properties.create',
  input: z.object({
    id: z.string(),
    title: z.string(),
    location: z.string(),
    image: z.string(),
    status: z.enum(['PRE_SALE', 'IN_CONSTRUCTION', 'COMPLETED']),
    roiPct: z.number(),
    progressPct: z.number(),
    priceRangeUsd: z.string().optional(),
    fixedRentPct: z.number().optional(),
    tokensTotal: z.number().optional(),
    launchDate: z.string().optional(),
    nextLaunchDate: z.string().optional(),
  }),
  dependencies: ['project'],
  handler: async (input, db) => {
    const { projects } = db.db._.schema!

    const newProject = await db.db.insert(projects).values({
      id: input.id,
      title: input.title,
      location: input.location,
      image: input.image,
      status: input.status,
      roiPct: input.roiPct,
      progressPct: input.progressPct,
      priceRangeUsd: input.priceRangeUsd,
      fixedRentPct: input.fixedRentPct,
      tokensTotal: input.tokensTotal,
      launchDate: input.launchDate,
      nextLaunchDate: input.nextLaunchDate,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return newProject[0]
  },
})

// Update a property
export const updateProperty = defineReactiveFunction({
  name: 'admin.properties.update',
  input: z.object({
    id: z.string(),
    title: z.string().optional(),
    location: z.string().optional(),
    image: z.string().optional(),
    status: z.enum(['PRE_SALE', 'IN_CONSTRUCTION', 'COMPLETED']).optional(),
    roiPct: z.number().optional(),
    progressPct: z.number().optional(),
    priceRangeUsd: z.string().optional(),
    fixedRentPct: z.number().optional(),
    tokensTotal: z.number().optional(),
    launchDate: z.string().optional(),
    nextLaunchDate: z.string().optional(),
  }),
  dependencies: ['project'],
  handler: async (input, db) => {
    const { projects } = db.db._.schema!
    const { id, ...updateData } = input

    const updated = await db.db
      .update(projects)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(projects.id, id))
      .returning()

    return updated[0]
  },
})

// Create a project unit
export const createProjectUnit = defineReactiveFunction({
  name: 'admin.units.create',
  input: z.object({
    id: z.string(),
    projectId: z.string(),
    unitCode: z.string(),
    title: z.string(),
    type: z.string(),
    floor: z.string(),
    areaM2: z.number().optional(),
    area: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    floorPlanImage: z.string().optional(),
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    isTokenized: z.boolean().default(false),
    investmentType: z.enum(['fixed_rent', 'appreciation', 'construction', 'full_property']).optional(),
    status: z.string(),
    price: z.string(),
    orientation: z.string().optional(),
    totalTokens: z.number().optional(),
  }),
  dependencies: ['project_unit'],
  handler: async (input, db) => {
    const { projectUnits } = db.db._.schema!

    const newUnit = await db.db.insert(projectUnits).values({
      ...input,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning()

    return newUnit[0]
  },
})

// Update a project unit
export const updateProjectUnit = defineReactiveFunction({
  name: 'admin.units.update',
  input: z.object({
    id: z.string(),
    unitCode: z.string().optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    floor: z.string().optional(),
    areaM2: z.number().optional(),
    area: z.string().optional(),
    bedrooms: z.number().optional(),
    bathrooms: z.number().optional(),
    floorPlanImage: z.string().optional(),
    tokenSymbol: z.string().optional(),
    tokenName: z.string().optional(),
    isTokenized: z.boolean().optional(),
    investmentType: z.enum(['fixed_rent', 'appreciation', 'construction', 'full_property']).optional(),
    status: z.string().optional(),
    price: z.string().optional(),
    orientation: z.string().optional(),
    totalTokens: z.number().optional(),
  }),
  dependencies: ['project_unit'],
  handler: async (input, db) => {
    const { projectUnits } = db.db._.schema!
    const { id, ...updateData } = input

    const updated = await db.db
      .update(projectUnits)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(projectUnits.id, id))
      .returning()

    return updated[0]
  },
})
