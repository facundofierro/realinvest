import { readSampleJson } from "@/lib/sample-data";

export interface ProjectPurchaseOption {
  key: string;
  title: string;
  subtitle: string;
  headerIcon: string;
  headerIconClassName: string;
  watermarkIcon: string;
  cardClassName: string;
  badgeText: string;
  badgeClassName: string;
  valueLabel: string;
  value: string;
  actionText: string;
  getHref: string;
  actionClassName: string;
  iconContainerClassName: string;
}

export async function getProjectPurchaseOptions(): Promise<
  ProjectPurchaseOption[]
> {
  return readSampleJson<
    ProjectPurchaseOption[]
  >("projectPurchaseOptions.json");
}
