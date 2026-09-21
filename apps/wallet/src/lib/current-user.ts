import { auth } from "@/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
    this.name = "UnauthorizedError";
  }
}

export async function getCurrentUserId(): Promise<string> {
  const userId = (await auth())?.user?.id;

  if (!userId) {
    throw new UnauthorizedError();
  }

  return userId;
}
