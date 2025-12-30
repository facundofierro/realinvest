import { NextResponse } from "next/server";
import { getProjectPurchaseOptions } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const purchaseOptions =
    await getProjectPurchaseOptions();
  return NextResponse.json({
    purchaseOptions,
  });
}

