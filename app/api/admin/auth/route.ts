import { NextRequest, NextResponse } from "next/server";

// Admin login now proxies to backend login and gates by role
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    const endpoint = baseUrl ? `${baseUrl}login` : undefined;

    if (!endpoint) {
      console.error("[admin/auth] FINSTACK_BACKEND_API_URL not set");
      return NextResponse.json(
        { error: "Server is not configured: FINSTACK_BACKEND_API_URL missing" },
        { status: 500 },
      );
    }

    const forwardBody = { email, password };
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({ message: "No JSON body" }));

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    // Determine role from response; allow if admin (case-insensitive)
    const role: string | undefined =
      (data as any)?.user?.role || (data as any)?.role;
    const isAdmin = typeof role === "string" && role.toLowerCase() === "admin";

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Access denied: admin role required" },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      success: true,
      user: (data as any)?.user ?? null,
    });

    // Set cookies on the response returned to the browser.
    response.cookies.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/admin",
    });

    // Also set access_token if provided, so admin API routes can forward Authorization
    const accessToken: string | undefined =
      (data as any)?.user?.accessToken ||
      (data as any)?.accessToken ||
      (data as any)?.token;
    if (accessToken) {
      response.cookies.set("access_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
    }

    return response;
  } catch (error: any) {
    console.error("[admin/auth] error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Authentication failed" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
