import type { KycApplication, KycStatus, KycSubmissionInput } from "./types";

export interface KycProvider {
  getStatus(userId: string): Promise<KycStatus>;
  getApplication(userId: string): Promise<KycApplication | null>;
  submitApplication(userId: string, input: KycSubmissionInput): Promise<KycApplication>;
}
