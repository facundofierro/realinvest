"use client";

import { useState } from "react";
import { useKycApplication } from "@/hooks/use-queries";

export function useKycGate() {
  const { data: application, isLoading } = useKycApplication();
  const status = application?.status ?? "none";
  const isApproved = status === "approved";
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);

  function guard(action: () => void) {
    if (isApproved) action();
    else setBlockedDialogOpen(true);
  }

  return { status, isApproved, isLoading, rejectionReason: application?.rejectionReason ?? null, blockedDialogOpen, setBlockedDialogOpen, guard };
}
