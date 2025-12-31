// Export page components for multiplatform usage
export { default as DashboardPage } from "./components/pages/dashboard-page";
export { default as ExchangePage } from "./components/pages/exchange-page";
export { default as ExchangeDetailPage } from "./components/pages/exchange-detail-page";
export { default as InvestPage } from "./components/pages/invest-page";
export { default as LoginPage } from "./components/pages/login-page";
export { default as ProjectDetailPage } from "./components/pages/project-detail-page";
export { default as ProjectUnitsPage } from "./components/pages/project-units-page";
export { default as AssetsPage } from "./components/pages/assets-page";
export { default as ChatPage } from "./components/pages/chat-page";
export { default as DepositPage } from "./components/pages/deposit-page";
export { default as WithdrawPage } from "./components/pages/withdraw-page";

export { BottomNav } from "./components/bottom-nav";

// Export types
export * from "./types/wallet";

// Export API client for data fetching
export * from "./lib/api-client";
