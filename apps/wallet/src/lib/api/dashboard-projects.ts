import { readSampleJson } from "@/lib/sample-data";

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
  return readSampleJson<DashboardProject[]>("dashboardProjects.json");
}