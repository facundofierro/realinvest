import type { KycStatus } from "@repo/db";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      kycStatus: KycStatus;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    kycStatus?: KycStatus;
  }
}
