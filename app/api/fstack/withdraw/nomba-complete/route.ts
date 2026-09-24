import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

// POST /api/fstack/withdraw/nomba-complete
// { amount, otpCode, destinationAccountNumber, institutionCode, accountName }
// Completes an NGN withdrawal via a real Nomba bank transfer. Separate from
// /api/fstack/withdraw/fiat-complete, which still handles CNGN -> Paycrest.
export async function POST(request: NextRequest) {
  try {
    if (!baseUrl) {
      console.error("[fstack/withdraw/nomba-complete] FINSTACK_BACKEND_API_URL not set");
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { amount, otpCode, destinationAccountNumber, institutionCode, accountName } = body;

    if (!amount || !otpCode || !destinationAccountNumber || !institutionCode || !accountName) {
      return NextResponse.json(
        {
          error:
            "amount, otpCode, destinationAccountNumber, institutionCode and accountName are required",
        },
        { status: 400 },
      );
    }

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${baseUrl}withdraw/nomba/complete`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        amount,
        otpCode,
        destinationAccountNumber,
        institutionCode,
        accountName,
      }),
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
    console.error("[fstack/withdraw/nomba-complete] POST error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to complete withdrawal" },
      { status: 500 },
    );
  }
}