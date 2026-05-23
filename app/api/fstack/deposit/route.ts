import { NextRequest, NextResponse } from "next/server";

// ─── Shared helper ─────────────────────────────────────────────────────────────

function getToken(request: NextRequest): string | undefined {
  return request.cookies.get("access_token")?.value;
}

function authHeaders(token?: string): Record<string, string> {
  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleUnauthorized(data: unknown): NextResponse {
  const out = NextResponse.json(data, { status: 401 });
  try {
    out.cookies.delete("access_token");
  } catch {}
  return out;
}

// ─── GET /api/fstack/deposit ────────────────────────────────────────────────
//   ?type=wallet  → proxy to GET /getWallet  (fetch all user wallets)
//   ?currency=X   → proxy to GET /deposit?currency=X  (fetch crypto deposit address)

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      console.error("[fstack/deposit] FINSTACK_BACKEND_API_URL not set");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const currency = searchParams.get("currency") || "USDC";

    const endpoint =
      type === "wallet"
        ? `${baseUrl}getWallet`
        : `${baseUrl}deposit?currency=${encodeURIComponent(currency)}`;

    const token = getToken(request);

    const res = await fetch(endpoint, {
      method: "GET",
      headers: authHeaders(token),
      cache: "no-store",
    });

    let data: unknown = {};
    try {
      data = await res.json();
    } catch {}

    // Removed stray comma expressions and fixed syntax

    if (res.status === 401) return handleUnauthorized(data);
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[fstack/deposit] GET error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch deposit data" },
      { status: 500 },
    );
  }
}

// ─── POST /api/fstack/deposit (Paycrest onramp) — commented out, persistent virtual account only ──
// export async function POST(request: NextRequest) {
//   ...Paycrest onramp logic removed...
// }
