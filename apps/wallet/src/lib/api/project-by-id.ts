import { readSampleJson } from "@/lib/sample-data";
import type { Project } from "@/types/wallet";

export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await readSampleJson<Project[]>("projects.json");
  return projects.find((p) => p.id === id) ?? null;
}