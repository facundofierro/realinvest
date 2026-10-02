import { initTRPC } from "@trpc/server";
import { and, desc, eq, sql } from "drizzle-orm";
import {
  balances,
  marketTokens,
  projects,
  transactions,
  units,
} from "@repo/db";
import { z } from "zod";
import { getDb } from "./db";

const t = initTRPC.create();
const router = t.router;
const publicProcedure = t.procedure;

const projectStatus = z.enum(["PRE_SALE", "IN_CONSTRUCTION", "COMPLETED"]);

const adminRouter = router({
  dashboard: router({
    stats: publicProcedure.input(z.object({})).query(async () => {
      const db = getDb();
      const [liquidity] = await db
        .select({ total: sql<number>`COALESCE(SUM(${balances.available}), 0)` })
        .from(balances);
      const [marketCap] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
        })
        .from(marketTokens);
      const [projectCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(projects);
      const [transactionCount] = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(transactions);
      const [mostValuable] = await db
        .select({
          id: projects.id,
          title: projects.title,
          value: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
        })
        .from(projects)
        .leftJoin(marketTokens, eq(projects.id, marketTokens.projectId))
        .groupBy(projects.id, projects.title)
        .orderBy(desc(sql`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`))
        .limit(1);
      const [highestRoi] = await db
        .select({
          id: projects.id,
          title: projects.title,
          roi: projects.roiPct,
        })
        .from(projects)
        .orderBy(desc(projects.roiPct))
        .limit(1);

      return {
        totalLiquidity: liquidity?.total ?? 0,
        totalTokenMarketCap: marketCap?.total ?? 0,
        totalProperties: Number(projectCount?.count ?? 0),
        totalTransactions: Number(transactionCount?.count ?? 0),
        mostValuableProperty: mostValuable ?? null,
        highestRoiProperty: highestRoi ?? null,
      };
    }),
  }),
  properties: router({
    statistics: publicProcedure.input(z.object({})).query(() =>
      getDb()
        .select({
          projectId: projects.id,
          projectTitle: projects.title,
          totalValue: sql<number>`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`,
          tokenCount: sql<number>`COUNT(${marketTokens.id})`,
        })
        .from(projects)
        .leftJoin(marketTokens, eq(projects.id, marketTokens.projectId))
        .groupBy(projects.id, projects.title)
        .orderBy(desc(sql`COALESCE(SUM(${marketTokens.marketCapUsd}), 0)`)),
    ),
    create: publicProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string(),
          location: z.string(),
          image: z.string(),
          status: projectStatus,
          roiPct: z.number(),
          progressPct: z.number(),
          priceRangeUsd: z.string().optional(),
          fixedRentPct: z.number().optional(),
          tokensTotal: z.number().optional(),
          launchDate: z.string().optional(),
          nextLaunchDate: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const [created] = await getDb()
          .insert(projects)
          .values(input)
          .returning();
        return created;
      }),
    update: publicProcedure
      .input(
        z.object({
          id: z.string(),
          title: z.string().optional(),
          location: z.string().optional(),
          image: z.string().optional(),
          status: projectStatus.optional(),
          roiPct: z.number().optional(),
          progressPct: z.number().optional(),
          priceRangeUsd: z.string().optional(),
          fixedRentPct: z.number().optional(),
          tokensTotal: z.number().optional(),
          launchDate: z.string().optional(),
          nextLaunchDate: z.string().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const [updated] = await getDb()
          .update(projects)
          .set(updateData)
          .where(eq(projects.id, id))
          .returning();
        return updated;
      }),
  }),
  units: router({
    create: publicProcedure
      .input(
        z.object({
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
          investmentType: z
            .enum([
              "fixed_rent",
              "appreciation",
              "construction",
              "full_property",
            ])
            .optional(),
          status: z.string(),
          price: z.string(),
          orientation: z.string().optional(),
          totalTokens: z.number().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const [created] = await getDb().insert(units).values(input).returning();
        return created;
      }),
    update: publicProcedure
      .input(
        z.object({
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
          investmentType: z
            .enum([
              "fixed_rent",
              "appreciation",
              "construction",
              "full_property",
            ])
            .optional(),
          status: z.string().optional(),
          price: z.string().optional(),
          orientation: z.string().optional(),
          totalTokens: z.number().optional(),
        }),
      )
      .mutation(async ({ input }) => {
        const { id, ...updateData } = input;
        const [updated] = await getDb()
          .update(units)
          .set(updateData)
          .where(eq(units.id, id))
          .returning();
        return updated;
      }),
  }),
  transactions: router({
    getAll: publicProcedure
      .input(
        z.object({
          type: z
            .enum(["DEPOSIT", "WITHDRAWAL", "BUY", "SELL", "DIVIDEND"])
            .optional(),
          status: z.enum(["PENDING", "COMPLETED", "FAILED"]).optional(),
          userId: z.string().optional(),
          limit: z.number().optional().default(100),
        }),
      )
      .query(({ input }) => {
        const conditions = [
          input.type ? eq(transactions.type, input.type) : undefined,
          input.status ? eq(transactions.status, input.status) : undefined,
          input.userId ? eq(transactions.userId, input.userId) : undefined,
        ].filter((condition): condition is NonNullable<typeof condition> =>
          Boolean(condition),
        );
        const query = getDb().select().from(transactions);
        return (conditions.length ? query.where(and(...conditions)) : query)
          .orderBy(desc(transactions.createdAt))
          .limit(input.limit);
      }),
  }),
});

export const appRouter = router({
  admin: adminRouter,
  projects: router({
    getAll: publicProcedure
      .input(z.object({ status: projectStatus.optional() }))
      .query(({ input }) => {
        const status = input.status;
        return status
          ? getDb().query.projects.findMany({
              where: (project, { eq }) => eq(project.status, status),
            })
          : getDb().query.projects.findMany();
      }),
  }),
});

export type AppRouter = typeof appRouter;
