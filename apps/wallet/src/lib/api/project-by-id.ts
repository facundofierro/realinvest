import { projects } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import type { Project } from "@/types/wallet";
import { mapProject } from "./projects";

export async function getProjectById(id: string): Promise<Project | null> {
  const [project] = await getDb().select({
    id: projects.id, title: projects.title, location: projects.location,
    image: projects.image, status: projects.status, roiPct: projects.roiPct,
    progressPct: projects.progressPct, priceRangeUsd: projects.priceRangeUsd,
    fixedRentPct: projects.fixedRentPct, tokensTotal: projects.tokensTotal,
    launchDate: projects.launchDate, nextLaunchDate: projects.nextLaunchDate,
  }).from(projects).where(eq(projects.id, id)).limit(1);
  return project ? mapProject(project) : null;
}
