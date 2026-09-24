import { NextRequest, NextResponse } from "next/server";

const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

// GET /api/fstack/withdraw/nomba-banks -> Nomba's own bank list.
// These codes ("058", "100033", ...) are NOT the same as the Paycrest
// institution codes in SUPPORTED_BANKS ("GTBINGLA") used by the existing
// CNGN -> Paycrest flow. This flow must always use codes from here.
export async function GET(request: NextRequest) {
  try {
    if (!baseUrl) {
      console.error("[fstack/withdraw/nomba-banks] FINSTACK_BACKEND_API_URL not set");
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${baseUrl}withdraw/nomba/banks`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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
    console.error("[fstack/withdraw/nomba-banks] GET error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to load bank list" },
      { status: 500 },
    );
  }
}