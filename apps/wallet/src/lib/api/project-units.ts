import { readSampleJson } from "@/lib/sample-data";
import type { ProjectUnit } from "@/types/wallet";

export async function getProjectUnits(
  projectId: string
): Promise<ProjectUnit[]> {
  const units = await readSampleJson<
    ProjectUnit[]
  >("projectUnits.json");
  const direct = units.filter(
    (u) => u.projectId === projectId
  );
  if (direct.length > 0) return direct;

  const isNumericId = /^\d+$/.test(
    projectId
  );
  if (!isNumericId) return direct;

  const projects = await readSampleJson<
    { id: string }[]
  >("projects.json");
  const index = Number(projectId) - 1;
  const resolvedProjectId =
    projects[index]?.id;
  if (!resolvedProjectId) return direct;

  return units.filter(
    (u) =>
      u.projectId === resolvedProjectId
  );
}
