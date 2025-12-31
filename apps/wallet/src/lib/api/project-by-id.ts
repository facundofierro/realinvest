import { readSampleJson } from "@/lib/sample-data";
import type { Project } from "@/types/wallet";

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await readSampleJson<Project[]>("projects.json");
  const direct = projects.find((p) => p.id === id) ?? null;
  if (direct) return direct;

  const isNumericId = /^\d+$/.test(id);
  if (!isNumericId) return null;

  const index = Number(id) - 1;
  return projects[index] ?? null;
}
