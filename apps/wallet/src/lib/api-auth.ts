import { auth } from "@/auth";
import { NextResponse } from "next/server";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}
