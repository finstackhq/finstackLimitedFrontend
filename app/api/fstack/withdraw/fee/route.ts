import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

// GET /api/fstack/withdraw/fee?currency=NGN -> configured WITHDRAWAL fee for a currency
export async function GET(request: NextRequest) {
  const currency = request.nextUrl.searchParams.get("currency");
  if (!currency) {
    return NextResponse.json({ error: "currency is required" }, { status: 400 });
  }
  if (!baseUrl) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  try {
    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${baseUrl}admin/fee-configs`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: body?.error || body?.message || "Failed to load fee" },
        { status: res.status },
      );
    }

    const list: any[] = Array.isArray(body?.data) ? body.data : [];
    const match = list.find(
      (c) => c?.type === "WITHDRAWAL" && c?.currency === currency,
    );
    const fee = match ? Number(match.feeAmount) : NaN;
    if (!Number.isFinite(fee)) {
      return NextResponse.json({ error: "No withdrawal fee configured" }, { status: 404 });
    }

    return NextResponse.json({ success: true, fee, currency });
  } catch (error: any) {
    console.error("[fstack/withdraw/fee] GET error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to load fee" },
      { status: 500 },
    );
  }
}
