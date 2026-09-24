import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

// POST /api/fstack/withdraw/nomba-initiate -> sends the OTP for a real
// Nomba NGN withdrawal. Separate from /api/fstack/withdraw/initiate, which
// still handles the existing CNGN/USDC flows (it checks live Blockradar
// balances, which has no concept of NGN).
export async function POST(request: NextRequest) {
  try {
    if (!baseUrl) {
      console.error("[fstack/withdraw/nomba-initiate] FINSTACK_BACKEND_API_URL not set");
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return NextResponse.json({ error: "amount is required" }, { status: 400 });
    }

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${baseUrl}withdraw/nomba/initiate`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ amount }),
      cache: "no-store",
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 });
      try {
        out.cookies.delete("access_token");
      } catch {}
      return out;
    }

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[fstack/withdraw/nomba-initiate] POST error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate withdrawal" },
      { status: 500 },
    );
  }
}