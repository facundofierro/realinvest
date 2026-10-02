"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";
import type { KycApplication } from "@repo/providers-kyc";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useKycCopy } from "./kyc-locale-context";

export function KycStatusScreen({ application, onRetry }: { application: KycApplication; onRetry: () => void }) {
  const { copy } = useKycCopy();
  const pending = application.status === "pending";
  const approved = application.status === "approved";
  const Icon = pending ? Clock3 : approved ? CheckCircle2 : AlertTriangle;
  const message = pending ? copy.status.pending : approved ? copy.status.approved : `${copy.status.rejectedPrefix} ${application.rejectionReason ?? ""}`;
  return <Card><CardContent className="space-y-5 p-6 text-center"><Icon className={`mx-auto h-12 w-12 ${approved ? "text-green-600" : pending ? "text-amber-500" : "text-destructive"}`} /><div className="space-y-1"><p className="font-semibold">{message}</p><p className="text-sm text-muted-foreground">{copy.status.submitted}: {new Date(application.submittedAt).toLocaleString()}</p></div>{approved && <Button asChild><Link href="/">{copy.status.goHome}</Link></Button>}{application.status === "rejected" && <Button onClick={onRetry}>{copy.status.retry}</Button>}</CardContent></Card>;
}
