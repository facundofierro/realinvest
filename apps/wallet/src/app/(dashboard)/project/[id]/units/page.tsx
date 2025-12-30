import ProjectUnitsPage from "@/components/pages/project-units-page";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams;
  const filter = resolvedSearchParams?.filter;

  return (
    <ProjectUnitsPage
      projectId={id}
      filter={filter}
    />
  );
}
