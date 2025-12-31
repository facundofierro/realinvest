import ExchangeDetailPage from "@/components/pages/exchange-detail-page";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;

  return <ExchangeDetailPage symbol={symbol} />;
}
