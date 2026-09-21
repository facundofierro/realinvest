import { units } from "@repo/db";
import { eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { ProjectUnit } from "@/types/wallet";

export async function getProjectUnits(
  projectId: string
): Promise<ProjectUnit[]> {
  const rows = await getDb().select().from(units)
    .where(eq(units.projectId, projectId)).orderBy(sql`rowid`);
  return rows.map(({ areaM2, area, bedrooms, bathrooms, floorPlanImage, tokenSymbol,
    tokenName, investmentType, statusRaw, queueOrder, orientation, totalTokens,
    tokensSold, negotiatedAmount, ...unit }) => ({
      ...unit,
      areaM2: areaM2 ?? undefined, area: area ?? undefined,
      bedrooms: bedrooms ?? undefined, bathrooms: bathrooms ?? undefined,
      floorPlanImage: floorPlanImage ?? undefined, tokenSymbol: tokenSymbol ?? "",
      tokenName: tokenName ?? undefined, investmentType: investmentType ?? undefined,
      statusRaw: statusRaw ?? undefined, queueOrder: queueOrder ?? undefined,
      orientation: orientation ?? undefined, totalTokens: totalTokens ?? undefined,
      tokensSold: tokensSold ?? undefined, negotiatedAmount: negotiatedAmount ?? undefined,
    }));
}
