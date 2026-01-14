import { NextRequest, NextResponse } from "next/server"

// POST /api/fstack/kycLiveliness -> proxies to backend kycLiveliness
// Body should include { kyc_session_id, selfie_url }
export async function POST(req: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const endpoint = baseUrl ? `${baseUrl}kycLiveliness` : undefined

  try {
    if (!endpoint) {
      console.error("[kycLiveliness] FINSTACK_BACKEND_API_URL not set")
      return NextResponse.json({ error: "Server not configured" }, { status: 500 })
    }

    const token = req.cookies.get("access_token")?.value
    const headers: Record<string, string> = { "Content-Type": "application/json" }
    if (token) headers["Authorization"] = `Bearer ${token}`

    const body = await req.json().catch(() => ({}))
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "No JSON body" }))
    console.log("[kycLiveliness] status:", res.status, " response:", data)

    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 })
      try { out.cookies.delete("access_token") } catch {}
      return out
    }

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error("[kycLiveliness] error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}