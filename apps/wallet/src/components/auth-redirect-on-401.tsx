"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { onUnauthorized } from "@/lib/auth-events";

// Turns API 401s into a single client-side redirect to /login (no document reload).
export function AuthRedirectOn401() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const redirecting = useRef(false);
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
    if (pathname !== "/login") redirecting.current = false;
  }, [pathname]);

  useEffect(
    () =>
      onUnauthorized(() => {
        const current = pathnameRef.current;
        if (redirecting.current || current === "/login") return;
        redirecting.current = true;
        void queryClient.cancelQueries();
        router.replace(`/login?callbackUrl=${encodeURIComponent(current)}`);
      }),
    [queryClient, router],
  );

  return null;
}
