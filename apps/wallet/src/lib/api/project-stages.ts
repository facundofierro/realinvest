import { readSampleJson } from "@/lib/sample-data";

export interface ProjectStage {
  id: number;
  name: string;
  date: string;
  status: string;
  units: number;
  available: number;
  minPrice: number;
}

export async function getProjectStages(): Promise<ProjectStage[]> {
  return readSampleJson<ProjectStage[]>("projectStages.json");
}