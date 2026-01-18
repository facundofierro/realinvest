"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TrpcReactiveProvider } from "@agelum/backend/client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@repo/backend";
import { SplashScreen } from "./splash-screen";

// Reactive relations configuration
const reactiveRelations = {
  project: ['project_unit', 'project_story', 'project_stage', 'project_purchase_option', 'market_token'],
  project_unit: ['project', 'market_token'],
  project_story: ['project'],
  project_stage: ['project'],
  project_purchase_option: ['project'],
  market_token: ['project', 'project_unit', 'holding', 'position', 'orderbook_level', 'market_series'],
  holding: ['market_token'],
  position: ['market_token', 'transaction'],
  transaction: ['position', 'wallet_balance'],
  wallet_balance: ['transaction'],
  orderbook_level: ['market_token'],
  market_series: ['market_token'],
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          url: "/api/trpc",
        }),
      ],
    })
  );

  // Default organization ID - in production, this would come from auth/session
  const organizationId = "default-org";

  return (
    <QueryClientProvider client={queryClient}>
      <TrpcReactiveProvider
        organizationId={organizationId}
        relations={reactiveRelations}
        trpcClient={trpcClient}
      >
        <SplashScreen>{children}</SplashScreen>
      </TrpcReactiveProvider>
    </QueryClientProvider>
  );
}
