import { z } from "zod";

export const kycIdentitySchema = z.object({
  fullName: z.string().min(3),
  dateOfBirth: z.string().min(1),
  nationality: z.string().min(1),
  documentType: z.string().min(1),
  documentNumber: z.string().min(3),
  address: z.string().optional(),
  isPoliticallyExposed: z.boolean(),
  isSanctioned: z.boolean(),
});

export const kycDocumentSchema = z.object({
  type: z.enum(["government_id", "proof_of_address", "selfie", "beneficial_owner_declaration", "other"]),
  fileName: z.string().min(1),
  uploadedAt: z.string().min(1),
});

export const beneficialOwnerSchema = z.object({
  fullName: z.string().min(3),
  documentNumber: z.string().min(3),
  ownershipPercentage: z.number().min(0).max(100),
  isPoliticallyExposed: z.boolean(),
});

export const kycSubmissionSchema = z.object({
  identity: kycIdentitySchema,
  documents: z.array(kycDocumentSchema).min(4),
  beneficialOwners: z.array(beneficialOwnerSchema).default([]),
});

export type KycSubmissionFormValues = z.infer<typeof kycSubmissionSchema>;
