import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/fee-configs -> current saved fee configurations
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

  try {
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${baseUrl}admin/fee-configs`, {
      method: "GET",
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

    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("[admin/fee-configs] GET error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to load fee configurations" },
      { status: 500 },
    );
  }
}
