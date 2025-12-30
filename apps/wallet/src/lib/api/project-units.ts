import { readSampleJson } from "@/lib/sample-data";
import type { ProjectUnit } from "@/types/wallet";

export async function getProjectUnits(projectId: string): Promise<ProjectUnit[]> {
  const units = await readSampleJson<ProjectUnit[]>("projectUnits.json");
  return units.filter((u) => u.projectId === projectId);
}