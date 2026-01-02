import { ExchangeDetailPage, type MarketToken } from "wallet";
import path from "path";
import { promises as fs } from "fs";

export async function generateStaticParams() {
  try {
    // Navigate from native/wallet/nextjs to apps/wallet
    const filePath = path.join(process.cwd(), "../../../apps/wallet/src/sample-data/marketTokens.json");
    const data = await fs.readFile(filePath, "utf8");
    const tokens = JSON.parse(data) as MarketToken[];
  
    return tokens.map((token) => ({
      symbol: token.symbol,
    }));
  } catch (error) {
    console.error("Error generating static params for exchange:", error);
    return [];
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ symbol: string }>;
}) {
  const { symbol } = await params;
  return <ExchangeDetailPage symbol={symbol} />;
}
