"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { SplashScreen } from "./splash-screen";
import { AuthRedirectOn401 } from "./auth-redirect-on-401";
import { AppSessionProvider } from "@/lib/session";
import { KycLocaleProvider } from "@/components/kyc/kyc-locale-context";

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
      }),
  );

  return (
    <AppSessionProvider>
      <QueryClientProvider client={queryClient}>
        <AuthRedirectOn401 />
        <KycLocaleProvider><SplashScreen>{children}</SplashScreen></KycLocaleProvider>
      </QueryClientProvider>
    </AppSessionProvider>
  );
}
