import ExchangeSellPageClient from "@/components/pages/exchange-sell-page-client";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <ExchangeSellPageClient symbol={symbol} />;
}