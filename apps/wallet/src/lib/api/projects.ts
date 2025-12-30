import { readSampleJson } from "@/lib/sample-data";
import type { Project } from "@/types/wallet";

export async function getProjects(): Promise<Project[]> {
  return await readSampleJson<Project[]>("projects.json");
}