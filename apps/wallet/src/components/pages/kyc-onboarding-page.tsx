"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useKycApplication } from "@/hooks/use-queries";
import { KycLocaleProvider, useKycCopy } from "@/components/kyc/kyc-locale-context";
import { KycWizard } from "@/components/kyc/kyc-wizard";
import { KycStatusScreen } from "@/components/kyc/kyc-status-screen";

function KycPageContent() {
  const { copy, locale, setLocale } = useKycCopy(); const { data: application, isLoading } = useKycApplication(); const { data: session, update } = useSession(); const [mode, setMode] = useState<"status" | "wizard">("wizard");
  useEffect(() => { if (application) setMode(application.status === "none" ? "wizard" : "status"); }, [application]);
  useEffect(() => { if (application && application.status !== session?.user?.kycStatus) void update(); }, [application?.status, session?.user?.kycStatus, update]);
  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" /></div>;
  return <div className="mx-auto max-w-xl space-y-6 p-4 duration-500 animate-in fade-in slide-in-from-bottom-4"><div className="flex items-center gap-2"><Button variant="ghost" size="icon" asChild><Link href="/"><ArrowLeft className="h-5 w-5" /></Link></Button><h1 className="flex-1 text-xl font-bold tracking-tight">{copy.pageTitle}</h1><div className="flex rounded-md border p-0.5 text-xs"><button className={`rounded px-2 py-1 ${locale === "es" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setLocale("es")}>ES</button><button className={`rounded px-2 py-1 ${locale === "en" ? "bg-primary text-primary-foreground" : ""}`} onClick={() => setLocale("en")}>EN</button></div></div>{mode === "status" && application ? <KycStatusScreen application={application} onRetry={() => setMode("wizard")} /> : <Card><CardContent className="p-6"><KycWizard initialValues={application ? { identity: application.identity, beneficialOwners: application.beneficialOwners } : undefined} onSubmitted={() => setMode("status")} /></CardContent></Card>}</div>;
}

export default function KycOnboardingPage() { return <KycLocaleProvider><KycPageContent /></KycLocaleProvider>; }
