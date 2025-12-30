import ProjectDetailPage from "@/components/pages/project-detail-page";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{
    returnTo?: string;
  }>;
}) {
  const { id } = await params;
  const resolvedSearchParams =
    searchParams instanceof Promise
      ? await searchParams
      : searchParams;
  const returnToRaw =
    resolvedSearchParams?.returnTo;
  const backHref =
    typeof returnToRaw === "string" &&
    returnToRaw.startsWith("/")
      ? returnToRaw
      : "/";

  return (
    <ProjectDetailPage
      id={id}
      backHref={backHref}
    />
  );
}
