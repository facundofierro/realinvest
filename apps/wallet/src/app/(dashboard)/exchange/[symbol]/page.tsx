import ExchangeDetailPageClient from "@/components/pages/exchange-detail-page-client";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <ExchangeDetailPageClient symbol={symbol} />;
}