import { ProjectUnitsPage } from "wallet";
import { generateStaticParams as generateProjectParams } from "../page";

export const generateStaticParams = generateProjectParams;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const { filter } = (await searchParams) as { filter?: string };
  return <ProjectUnitsPage projectId={id} filter={filter} />;
}
