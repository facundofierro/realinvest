import { projectStories } from "@repo/db";
import { getDb } from "@/lib/db";

export interface ProjectStory {
  id: number;
  title: string;
  image: string;
  color: string;
}

export async function getProjectStories(): Promise<ProjectStory[]> {
  return getDb().select().from(projectStories).orderBy(projectStories.id);
}
