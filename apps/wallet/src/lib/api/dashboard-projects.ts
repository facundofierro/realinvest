import { projects } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";

export interface DashboardProject {
  id: string;
  title: string;
  location: string;
  image: string;
  status: string;
  roi: number;
  progress: number;
  priceRange: string;
  fixedRent: number;
}

export async function getDashboardProjects(): Promise<DashboardProject[]> {
  const rows = await getDb().select().from(projects)
    .where(eq(projects.isFeatured, true)).orderBy(projects.id);
  const statusByValue = {
    PRE_SALE: "PRE-VENTA",
    IN_CONSTRUCTION: "EN CONSTRUCCION",
    COMPLETED: "COMPLETADO",
  } as const;
  return rows.map((project) => ({
    id: project.id, title: project.title, location: project.location, image: project.image,
    status: statusByValue[project.status], roi: project.roiPct,
    progress: project.progressPct, priceRange: project.priceRangeUsd ?? "",
    fixedRent: project.fixedRentPct ?? 0,
  }));
}
