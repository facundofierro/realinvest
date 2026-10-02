"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSession } from "@/lib/session";

export function RequireSession({ children }: { children: React.ReactNode }) {
  const { status } = useAppSession();
  const router = useRouter();
  useEffect(() => { if (status === "unauthenticated") router.replace("/login"); }, [router, status]);
  if (status !== "authenticated") return <div className="min-h-screen bg-background" aria-busy="true" />;
  return <>{children}</>;
}
