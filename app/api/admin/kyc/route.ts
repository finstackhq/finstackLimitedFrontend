import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/kyc -> proxy to backend getAllKycs
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const cleanBaseUrl = baseUrl?.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const endpoint = cleanBaseUrl ? `${cleanBaseUrl}/admin/getAllKycs` : undefined;
  try {
    if (!endpoint) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const upstreamParams = new URLSearchParams();

    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const status = searchParams.get("status");

    if (page) upstreamParams.set("page", page);
    if (limit) upstreamParams.set("limit", limit);
    if (status && status !== "all") upstreamParams.set("status", status);

    const upstreamUrl = upstreamParams.toString()
      ? `${endpoint}?${upstreamParams.toString()}`
      : endpoint;

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(upstreamUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ message: "No JSON body" }));
    // If unauthorized, clear cookies so admin is logged out automatically
    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 });
      try {
        out.cookies.delete("access_token");
        out.cookies.set("admin_session", "", {
          path: "/admin",
          maxAge: 0,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      } catch {}
      return out;
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch KYC requests" },
      { status: 500 },
    );
  }
}

// PUT /api/admin/kyc -> proxy to backend updateKyc with { id, status, reason? }
export async function PUT(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

  try {
    const body = await request.json();
    const { id, status, rejectionReason } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "id and status are required" },
        { status: 400 },
      );
    }

    const cleanBaseUrl = baseUrl?.endsWith("/")
      ? baseUrl.slice(0, -1)
      : baseUrl;
    const endpoint = `${cleanBaseUrl}/admin/updateKyc`;

    const token = request.cookies.get("access_token")?.value;

    const res = await fetch(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id, status, rejectionReason }),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ message: "No JSON body" }));
    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 });
      try {
        out.cookies.delete("access_token");
        out.cookies.set("admin_session", "", {
          path: "/admin",
          maxAge: 0,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      } catch {}
      return out;
    }
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
