import { NextRequest, NextResponse } from "next/server";

const FEE_TYPES = ["P2P", "DEPOSIT", "WITHDRAWAL"];

// POST /api/admin/fees-update -> save one fee setting
export async function POST(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

  try {
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const { type, currency, targetCurrency, feeAmount } = await request.json();

    if (!FEE_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "type must be P2P, DEPOSIT, or WITHDRAWAL" },
        { status: 400 },
      );
    }
    if (!currency || typeof feeAmount !== "number" || !(feeAmount >= 0)) {
      return NextResponse.json(
        { error: "currency and a non-negative feeAmount are required" },
        { status: 400 },
      );
    }
    if (type === "P2P" && !targetCurrency) {
      return NextResponse.json(
        { error: "targetCurrency is required for P2P fees" },
        { status: 400 },
      );
    }

    const payload =
      type === "P2P"
        ? { type, currency, targetCurrency, feeAmount }
        : { type, currency, feeAmount };

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${baseUrl}admin/fees-update`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[admin/fees-update] POST error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to update fee" },
      { status: 500 },
    );
  }
}
