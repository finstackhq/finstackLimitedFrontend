import { NextRequest, NextResponse } from "next/server"

// POST /api/fstack/kycSession -> proxies to backend kycSession to create a session
// Expects Authorization via cookie access_token
export async function POST(req: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const endpoint = baseUrl ? `${baseUrl}kycSession` : undefined

  try {
    if (!endpoint) {
      console.error("[kycSession] FINSTACK_BACKEND_API_URL not set")
      return NextResponse.json({ error: "Server not configured" }, { status: 500 })
    }

    const token = req.cookies.get("access_token")?.value
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    // Forward any JSON body provided (optional)
    let body: any = null
    const contentType = req.headers.get("content-type") || ""
    if (contentType.includes("application/json")) {
      try { body = await req.json() } catch {}
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "No JSON body" }))
    console.log("[kycSession] status:", res.status, " response:", data)

    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 })
      try { out.cookies.delete("access_token") } catch {}
      return out
    }

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error("[kycSession] error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}