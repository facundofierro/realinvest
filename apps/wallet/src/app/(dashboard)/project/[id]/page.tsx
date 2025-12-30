import { notFound } from "next/navigation";
import ProjectDetailPage from "@/components/pages/project-detail-page";
import {
  getProjectStories,
  getProjectStages,
  getProjectPurchaseOptions,
} from "@/lib/api";
import type { ProjectPurchaseOption } from "@/lib/api/project-purchase-options";
import type { PurchaseOption } from "@/components/pages/project-detail-page";
import {
  Wallet,
  DollarSign,
  Building2,
  Hammer,
} from "lucide-react";

const iconMap = {
  Wallet,
  DollarSign,
  Building2,
  Hammer,
} as const;

function mapPurchaseOptions(
  options: ProjectPurchaseOption[]
): PurchaseOption[] {
  return options.map((option) => ({
    ...option,
    headerIcon:
      iconMap[
        option.headerIcon as keyof typeof iconMap
      ] || Wallet,
    watermarkIcon:
      iconMap[
        option.watermarkIcon as keyof typeof iconMap
      ] || Wallet,
    getHref: (id: string) =>
      option.getHref.replace(
        "{id}",
        id
      ),
  }));
}

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

  let stories;
  let stages;
  let purchaseOptions;

  try {
    [stories, stages, purchaseOptions] =
      await Promise.all([
        getProjectStories(),
        getProjectStages(),
        getProjectPurchaseOptions(),
      ]);
  } catch {
    notFound();
  }

  const mappedPurchaseOptions =
    mapPurchaseOptions(purchaseOptions);

  return (
    <ProjectDetailPage
      id={id}
      backHref={backHref}
      stories={stories}
      stages={stages}
      purchaseOptions={
        mappedPurchaseOptions
      }
    />
  );
}
