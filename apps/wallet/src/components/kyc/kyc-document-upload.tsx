"use client";

import { Button } from "@repo/ui/components/ui/button";
import { Card, CardContent } from "@repo/ui/components/ui/card";
import { useKycCopy } from "./kyc-locale-context";

export function KycDocumentUpload({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  const { copy } = useKycCopy();
  return <Card><CardContent className="p-3"><label className="block cursor-pointer rounded-md border border-dashed p-4 text-center text-sm hover:bg-muted/50"><input className="sr-only" type="file" accept="image/*,application/pdf" onChange={(event) => onChange(event.target.files?.[0] ?? null)} /><span className="block font-medium">{label}</span><span className="mt-1 block text-muted-foreground">{file?.name ?? copy.documents.select}</span></label>{file && <div className="mt-2 flex justify-end"><Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>{copy.nav.remove}</Button></div>}</CardContent></Card>;
}
