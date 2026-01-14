import { NextRequest, NextResponse } from "next/server"

// POST /api/fstack/logout -> proxy to backend logout and clear local auth cookie
export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  const token = req.cookies.get("access_token")?.value

  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      // If base URL is not configured, clear cookie locally and return 500
      const res = NextResponse.json(
        { message: "Backend base URL not configured", cause: "config" },
        { status: 500 }
      )
      try {
        res.cookies.delete("access_token")
      } catch {}
      return res
    }
    const endpoint = `${baseUrl}logout`
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await upstream.json().catch(() => ({}))

    // Build response and always clear local access_token cookie
    const res = NextResponse.json(
      data && Object.keys(data).length ? data : { message: "Logged out" },
      { status: upstream.status }
    )
    try {
      res.cookies.delete("access_token")
    } catch {}

    return res
  } catch (e: any) {
    clearTimeout(timeout)
    // On network/timeout errors, still clear cookie locally so user is logged out client-side
    const res = NextResponse.json(
      { message: "Logout failed upstream; local session cleared", cause: e?.name || "network" },
      { status: 502 }
    )
    try {
      res.cookies.delete("access_token")
    } catch {}
    return res
  }
}