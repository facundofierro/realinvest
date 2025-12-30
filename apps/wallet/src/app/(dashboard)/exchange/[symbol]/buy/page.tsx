import ExchangeBuyPageClient from "@/components/pages/exchange-buy-page-client";

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <ExchangeBuyPageClient symbol={symbol} />;
}