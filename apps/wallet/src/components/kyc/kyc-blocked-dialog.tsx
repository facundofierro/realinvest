"use client";

import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@repo/ui/components/ui/dialog";
import { Button } from "@repo/ui/components/ui/button";
import { useKycCopy } from "@/components/kyc/kyc-locale-context";
import type { KycStatus } from "@repo/providers-kyc";

export function KycBlockedDialog({ open, onOpenChange, status, rejectionReason }: { open: boolean; onOpenChange: (open: boolean) => void; status: KycStatus; rejectionReason?: string | null }) {
  const { copy } = useKycCopy();
  // This dialog is only opened for blocked statuses; the fallback keeps it safe if state changes while open.
  const blockedStatus = status === "approved" ? "none" : status;
  const blocked = copy.blocked[blockedStatus];
  const description = status === "rejected"
    ? `${copy.status.rejectedPrefix}${rejectionReason ? ` ${rejectionReason}` : ""}`
    : blockedStatus === "none" ? copy.blocked.none.description : copy.status.pending;
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>{blocked.title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      <DialogFooter><Button asChild><Link href="/kyc">{blocked.action}</Link></Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
