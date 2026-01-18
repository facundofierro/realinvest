export interface DashboardStats {
  totalLiquidity: number;
  totalTokenMarketCap: number;
  totalProperties: number;
  totalUsers: number;
  totalTransactions: number;
  mostValuableProperty?: {
    id: string;
    title: string;
    value: number;
  };
  mostTradedProperty?: {
    id: string;
    title: string;
    trades: number;
  };
  highestRoiProperty?: {
    id: string;
    title: string;
    roi: number;
  };
}

export interface PropertyStatistic {
  projectId: string;
  projectTitle: string;
  totalValue: number;
  totalTrades: number;
  totalTokensSold: number;
  averagePrice: number;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  type: string;
  status: string;
  amount: number;
  currencyCode: string;
  description?: string;
  createdAt: Date;
}
