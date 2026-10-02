export type KycStatus = "none" | "pending" | "approved" | "rejected";

export type KycDocumentType =
  | "government_id"
  | "proof_of_address"
  | "selfie"
  | "beneficial_owner_declaration"
  | "other";

export interface KycDocument {
  type: KycDocumentType;
  fileName: string;
  uploadedAt: string;
}

export interface KycIdentity {
  fullName: string;
  dateOfBirth: string;
  nationality: string;
  documentType: string;
  documentNumber: string;
  address?: string;
  isPoliticallyExposed: boolean;
  isSanctioned: boolean;
}

export interface BeneficialOwnerDeclaration {
  fullName: string;
  documentNumber: string;
  ownershipPercentage: number;
  isPoliticallyExposed: boolean;
}

export interface ScreeningResult {
  pepMatch: boolean;
  sanctionsMatch: boolean;
  checkedAt: string;
}

export interface KycSubmissionInput {
  identity: KycIdentity;
  documents: KycDocument[];
  beneficialOwners?: BeneficialOwnerDeclaration[];
}

export interface KycApplication {
  id: string;
  userId: string;
  status: KycStatus;
  identity: KycIdentity;
  documents: KycDocument[];
  beneficialOwners: BeneficialOwnerDeclaration[];
  screening: ScreeningResult | null;
  rejectionReason: string | null;
  submittedAt: string;
  decidedAt: string | null;
}
