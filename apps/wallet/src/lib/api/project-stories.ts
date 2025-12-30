import { readSampleJson } from "@/lib/sample-data";

export interface ProjectStory {
  id: number;
  title: string;
  image: string;
  color: string;
}

export async function getProjectStories(): Promise<ProjectStory[]> {
  return readSampleJson<ProjectStory[]>("projectStories.json");
}