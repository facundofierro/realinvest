import { ProjectDetailPage, type Project } from "wallet";
import path from "path";
import { promises as fs } from "fs";

export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), "../../../apps/wallet/src/sample-data/projects.json");
    const data = await fs.readFile(filePath, "utf8");
    const projects = JSON.parse(data) as Project[];
  
    return projects.map((project) => ({
      id: project.id,
    }));
  } catch (error) {
    console.error("Error generating static params for projects:", error);
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectDetailPage id={id} backHref="/" />;
}
