"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import type { KycApplication, KycDocumentType } from "@repo/providers-kyc";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/components/ui/select";
import { kycIdentitySchema, beneficialOwnerSchema } from "@/lib/kyc-schema";
import { useSubmitKyc } from "@/hooks/use-queries";
import { useKycCopy } from "./kyc-locale-context";
import { KycStepper } from "./kyc-stepper";
import { KycDocumentUpload } from "./kyc-document-upload";
import { BeneficialOwnerFields } from "./beneficial-owner-fields";
import { z } from "zod";

const wizardSchema = z.object({ identity: kycIdentitySchema, beneficialOwners: z.array(beneficialOwnerSchema), noBeneficialOwner: z.boolean() });
export type WizardValues = z.infer<typeof wizardSchema>;
const documentSlots: { key: "idFront" | "idBack" | "selfie" | "proof"; type: KycDocumentType }[] = [{ key: "idFront", type: "government_id" }, { key: "idBack", type: "government_id" }, { key: "selfie", type: "selfie" }, { key: "proof", type: "proof_of_address" }];

export function KycWizard({ initialValues, onSubmitted }: { initialValues?: Partial<Pick<KycApplication, "identity" | "beneficialOwners">>; onSubmitted: (application: KycApplication) => void }) {
  const { copy } = useKycCopy(); const router = useRouter(); const submit = useSubmitKyc(); const [step, setStep] = useState(0); const [files, setFiles] = useState<Record<string, File | null>>({ idFront: null, idBack: null, selfie: null, proof: null });
  const form = useForm<WizardValues>({ resolver: zodResolver(wizardSchema), defaultValues: { identity: { fullName: "", dateOfBirth: "", nationality: "", documentType: "", documentNumber: "", address: "", isPoliticallyExposed: false, isSanctioned: false, ...initialValues?.identity }, beneficialOwners: initialValues?.beneficialOwners ?? [], noBeneficialOwner: !(initialValues?.beneficialOwners?.length) } });
  const next = async () => { if (step === 1 && documentSlots.some(({ key }) => !files[key])) return; const fields = step === 0 ? ["identity.fullName", "identity.dateOfBirth", "identity.nationality", "identity.documentType", "identity.documentNumber"] as const : step === 3 ? ["identity.isPoliticallyExposed", "identity.isSanctioned"] as const : undefined; if (!fields || await form.trigger(fields)) setStep((value) => Math.min(4, value + 1)); };
  const onSubmit = form.handleSubmit(async (values) => { const application = await submit.mutateAsync({ identity: values.identity, beneficialOwners: values.noBeneficialOwner ? [] : values.beneficialOwners, documents: documentSlots.map(({ key, type }) => ({ type, fileName: files[key]!.name, uploadedAt: new Date().toISOString() })) }); onSubmitted(application); });
  const labels = [copy.documents.idFront, copy.documents.idBack, copy.documents.selfie, copy.documents.proofOfAddress];
  return <FormProvider {...form}><form onSubmit={onSubmit} className="space-y-6"><KycStepper steps={copy.stepLabels} currentStep={step} />
    {step === 0 && <div className="space-y-4">{(["fullName", "dateOfBirth", "nationality", "documentNumber"] as const).map((name) => <label key={name} className="block space-y-2"><span className="text-sm font-medium">{copy.identity[name]}</span><Input type={name === "dateOfBirth" ? "date" : "text"} {...form.register(`identity.${name}`)} />{form.formState.errors.identity?.[name] && <span className="text-sm text-destructive">{String(form.formState.errors.identity[name]?.message)}</span>}</label>)}<label className="block space-y-2"><span className="text-sm font-medium">{copy.identity.documentType}</span><Select onValueChange={(value) => form.setValue("identity.documentType", value, { shouldValidate: true })} value={form.watch("identity.documentType")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DNI">DNI</SelectItem><SelectItem value="Cédula">Cédula</SelectItem><SelectItem value="Pasaporte">Pasaporte</SelectItem></SelectContent></Select></label><label className="block space-y-2"><span className="text-sm font-medium">{copy.identity.address}</span><Textarea {...form.register("identity.address")} /></label></div>}
    {step === 1 && <div className="space-y-3">{documentSlots.map(({ key }, index) => <KycDocumentUpload key={key} label={labels[index]} file={files[key]} onChange={(file) => setFiles((current) => ({ ...current, [key]: file }))} />)}<p className="text-sm text-muted-foreground">{copy.documents.demoHint}</p>{documentSlots.some(({ key }) => !files[key]) && <p className="text-sm text-destructive">{copy.documents.required}</p>}</div>}
    {step === 2 && <BeneficialOwnerFields />}
    {step === 3 && <div className="space-y-6">{(["isPoliticallyExposed", "isSanctioned"] as const).map((name) => <div key={name} className="space-y-3"><p className="text-sm font-medium">{name === "isPoliticallyExposed" ? copy.pepSanctions.pepQuestion : copy.pepSanctions.sanctionsQuestion}</p><div className="flex gap-5"><label className="flex items-center gap-2"><Checkbox checked={form.watch(`identity.${name}`)} onCheckedChange={() => form.setValue(`identity.${name}`, true)} />{copy.pepSanctions.yes}</label><label className="flex items-center gap-2"><Checkbox checked={!form.watch(`identity.${name}`)} onCheckedChange={() => form.setValue(`identity.${name}`, false)} />{copy.pepSanctions.no}</label></div></div>)}</div>}
    {step === 4 && <div className="space-y-3 rounded-lg border p-4"><h2 className="font-semibold">{copy.review.title}</h2><p>{form.getValues("identity.fullName")} · {form.getValues("identity.documentNumber")}</p><p className="text-sm text-muted-foreground">{copy.review.documents}: {documentSlots.map(({ key }) => files[key]?.name).join(", ")}</p></div>}
    <div className="flex justify-between gap-3"><Button type="button" variant="outline" onClick={() => step === 0 ? router.back() : setStep((value) => value - 1)}>{copy.nav.back}</Button>{/* Distinct keys: reusing one DOM node lets the "next" click land on a submit button and skip the review step. */}{step === 4 ? <Button key="submit" type="submit" disabled={submit.isPending}>{copy.nav.submit}</Button> : <Button key="next" type="button" onClick={() => void next()}>{copy.nav.next}</Button>}</div>
  </form></FormProvider>;
}
