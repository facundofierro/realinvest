"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@repo/ui/components/ui/button";
import { Checkbox } from "@repo/ui/components/ui/checkbox";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { useKycCopy } from "./kyc-locale-context";
import type { WizardValues } from "./kyc-wizard";

export function BeneficialOwnerFields() {
  const { copy } = useKycCopy();
  const { register, watch, setValue } = useFormContext<WizardValues>();
  const { fields, append, remove } = useFieldArray({ control: useFormContext<WizardValues>().control, name: "beneficialOwners" });
  const none = watch("noBeneficialOwner");
  return <div className="space-y-4"><label className="flex items-center gap-2 text-sm"><Checkbox checked={none} onCheckedChange={(checked) => { setValue("noBeneficialOwner", Boolean(checked)); if (checked) setValue("beneficialOwners", []); }} />{copy.beneficialOwner.none}</label>{!none && <>{fields.map((field, index) => <div key={field.id} className="space-y-3 rounded-lg border p-4"><Input placeholder={copy.beneficialOwner.fullName} {...register(`beneficialOwners.${index}.fullName`)} /><Input placeholder={copy.beneficialOwner.documentNumber} {...register(`beneficialOwners.${index}.documentNumber`)} /><Input type="number" min="0" max="100" placeholder={copy.beneficialOwner.ownershipPercentage} {...register(`beneficialOwners.${index}.ownershipPercentage`, { valueAsNumber: true })} /><label className="flex items-center gap-2 text-sm"><Checkbox checked={watch(`beneficialOwners.${index}.isPoliticallyExposed`)} onCheckedChange={(checked) => setValue(`beneficialOwners.${index}.isPoliticallyExposed`, Boolean(checked))} />{copy.beneficialOwner.isPoliticallyExposed}</label><Button type="button" variant="outline" size="sm" onClick={() => remove(index)}>{copy.beneficialOwner.remove}</Button></div>)}<Button type="button" variant="outline" onClick={() => append({ fullName: "", documentNumber: "", ownershipPercentage: 0, isPoliticallyExposed: false })}>{copy.beneficialOwner.add}</Button></>}</div>;
}
