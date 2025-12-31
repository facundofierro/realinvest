export type CurrencyCode = "USDT";

export interface MoneyAmount {
  currencyCode: CurrencyCode;
  amount: number;
}

export interface WalletBalance {
  currencyCode: CurrencyCode;
  available: number;
  locked: number;
}

export type ProjectStatus =
  | "PRE_SALE"
  | "IN_CONSTRUCTION"
  | "COMPLETED";

export interface Project {
  id: string;
  title: string;
  location: string;
  image: string;
  status: ProjectStatus;
  roiPct: number;
  progressPct: number;
  priceRangeUsd?: string;
  fixedRentPct?: number;
  tokensTotal?: number;
  launchDate?: string;
  nextLaunchDate?: string;
}

export interface ProjectUnit {
  id: string;
  projectId: string;
  unitCode: string;
  title: string;
  areaM2?: number;
  area?: string;
  bedrooms?: number;
  bathrooms?: number;
  floorPlanImage?: string;
  tokenSymbol: string;
  tokenName?: string;
  isTokenized: boolean;
  investmentType?: string;
  status: string;
  statusRaw?: string;
  price: string;
  queueOrder?: number;
  orientation?: string;
  totalTokens?: number;
  tokensSold?: number;
  negotiatedAmount?: string;
  type: string;
  floor: string;
}

export interface MarketToken {
  id: string;
  unitId?: string;
  symbol: string;
  projectId: string;
  projectTitle: string;
  priceUsd: number;
  marketCapUsd: number;
  change24hPct: number;
  change7dPct: number;
  change30dPct: number;
  changeAllPct: number;
  liveSince: string;
  isFavorite: boolean;
  tokensAvailable?: number;
  roiPct?: number;
  buyPriceUsd?: number;
  sellPriceUsd?: number;
}

export interface Holding {
  id: string;
  tokenId: string;
  unitCode: string;
  tokenSymbol: string;
  projectTitle: string;
  location: string;
  tokens: number;
  marketPriceUsd: number;
  costBasisPriceUsd?: number;
  changePct?: number;
}

export type PositionSide =
  | "BUY"
  | "SELL";
export type PositionStatus =
  | "OPEN"
  | "PARTIALLY_FILLED"
  | "FILLED"
  | "CANCELLED";

export interface Position {
  id: string;
  tokenId: string;
  tokenSymbol: string;
  side: PositionSide;
  totalAmount: number;
  filledAmount: number;
  openedAt?: string;
  openedMarketPriceUsd?: number;
  orderPriceUsd: number;
  marketPriceUsd: number;
  status: PositionStatus;
}

export type TransactionType =
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "BUY"
  | "SELL"
  | "DIVIDEND";

export type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  createdAt: string;
  amount: MoneyAmount;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface OrderBookLevel {
  price: number;
  amount: number;
}

export interface MarketOrderBook {
  asks: OrderBookLevel[];
  bids: OrderBookLevel[];
}

export interface MarketSeries {
  series: number[];
}

export interface ProjectStory {
  id: number;
  title: string;
  image: string;
  color: string;
}

export interface ProjectStage {
  id: number;
  name: string;
  date: string;
  status: string;
  units: number;
  available: number;
  minPrice: number;
}

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
