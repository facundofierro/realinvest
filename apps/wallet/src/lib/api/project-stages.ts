import { stages } from "@repo/db";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";

export interface ProjectStage {
  id: number;
  name: string;
  date: string;
  status: string;
  units: number;
  available: number;
  minPrice: number;
}

export async function getProjectStages(projectId: string): Promise<ProjectStage[]> {
  return getDb().select().from(stages)
    .where(eq(stages.projectId, projectId)).orderBy(stages.id);
}
