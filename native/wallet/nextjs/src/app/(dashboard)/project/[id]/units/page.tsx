import { ProjectUnitsPage } from "wallet";
import { generateStaticParams as generateProjectParams } from "../page";

export const generateStaticParams = generateProjectParams;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProjectUnitsPage projectId={id} />;
}
