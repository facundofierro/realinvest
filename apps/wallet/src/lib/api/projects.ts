import { projects } from "@repo/db";
import { desc } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Project } from "@/types/wallet";

export function mapProject(project: {
  id: string; title: string; location: string; image: string; status: Project["status"];
  roiPct: number; progressPct: number; priceRangeUsd: string | null; fixedRentPct: number | null;
  tokensTotal: number | null; launchDate: string | null; nextLaunchDate: string | null;
}): Project {
  return {
    ...project, priceRangeUsd: project.priceRangeUsd ?? undefined,
    fixedRentPct: project.fixedRentPct ?? undefined, tokensTotal: project.tokensTotal ?? undefined,
    launchDate: project.launchDate ?? undefined, nextLaunchDate: project.nextLaunchDate ?? undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  const rows = await getDb().select({
    id: projects.id, title: projects.title, location: projects.location,
    image: projects.image, status: projects.status, roiPct: projects.roiPct,
    progressPct: projects.progressPct, priceRangeUsd: projects.priceRangeUsd,
    fixedRentPct: projects.fixedRentPct, tokensTotal: projects.tokensTotal,
    launchDate: projects.launchDate, nextLaunchDate: projects.nextLaunchDate,
  }).from(projects).orderBy(desc(projects.launchDate));
  return rows.map(mapProject);
}
