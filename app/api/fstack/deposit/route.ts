// import { NextRequest, NextResponse } from "next/server"

// // GET /api/fstack/deposit - Proxy to backend deposit endpoint
// // Supports ?type=wallet to fetch virtual account details from getWallet endpoint
// export async function GET(request: NextRequest) {
//     try {
//         const baseUrl = process.env.FINSTACK_BACKEND_API_URL
//         if (!baseUrl) {
//             console.error('[fstack/deposit] FINSTACK_BACKEND_API_URL not set')
//             return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
//         }

//         const { searchParams } = new URL(request.url)
//         const type = searchParams.get('type')
//         const currency = searchParams.get('currency') || 'USDC'

//         // If type=wallet, fetch virtual account details from getWallet endpoint
//         let endpoint: string
//         if (type === 'wallet') {
//             endpoint = `${baseUrl}getWallet`
//         } else {
//             endpoint = `${baseUrl}deposit?currency=${encodeURIComponent(currency)}`
//         }

//         const token = request.cookies.get('access_token')?.value

//         const res = await fetch(endpoint, {
//             method: 'GET',
//             headers: {
//                 'Accept': 'application/json',
//                 'Content-Type': 'application/json',
//                 ...(token ? { Authorization: `Bearer ${token}` } : {}),
//             },
//             cache: 'no-store',
//         })

//         let data: any = null
//         try {
//             data = await res.json()
//         } catch {
//             data = {}
//         }

//         // Auto-logout on unauthorized
//         if (res.status === 401) {
//             const out = NextResponse.json(data, { status: 401 })
//             try {
//                 out.cookies.delete('access_token')
//             } catch { }
//             return out
//         }

//         return NextResponse.json(data, { status: res.status })
//     } catch (error: any) {
//         console.error('[fstack/deposit] GET error:', error?.message || error)
//         return NextResponse.json(
//             { error: error?.message || 'Failed to fetch deposit address' },
//             { status: 500 }
//         )
//     }
// }

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

// ─── POST /api/fstack/deposit ────────────────────────────────────────────────
//   Body: { amount, fiatCurrency, stablecoin }
//   Proxied to backend POST /onramp/initiate
//
//   Expected backend response (OnrampOrderResponse):
//   {
//     success: true,
//     reference: "...",
//     orderId: "...",
//     amount: 50000,
//     currency: "NGN",
//     stablecoin: "USDC",
//     virtualAccount: {
//       bankName: "...",
//       accountName: "...",
//       accountNumber: "...",
//       expiresAt: "2024-01-01T12:30:00.000Z"  // optional
//     }
//   }

export async function POST(request: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    if (!baseUrl) {
      console.error("[fstack/deposit] FINSTACK_BACKEND_API_URL not set");
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const token = getToken(request);

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const res = await fetch(`${baseUrl}onramp/initiate`, {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(body),
      // No cache — this is a mutable action
    });

    let data: unknown = {};
    try {
      data = await res.json();
    } catch {}

    if (res.status === 401) return handleUnauthorized(data);
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[fstack/deposit] POST error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to initiate onramp" },
      { status: 500 },
    );
  }
}
