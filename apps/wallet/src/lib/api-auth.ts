import { auth } from "@/auth";
import { verifyAccessToken } from "@/lib/native-auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export async function requireUser() {
  const authorization = (await headers()).get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const nativeUser = await verifyAccessToken(authorization.slice("Bearer ".length));
    if (nativeUser) return nativeUser;
  }
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  return session.user;
}
