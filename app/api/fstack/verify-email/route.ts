import { NextRequest, NextResponse } from "next/server"

// Proxy email verification to the upstream backend
export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      return NextResponse.json(
        { message: "Backend base URL not configured", cause: "config" },
        { status: 500 }
      )
    }

    const body = await req.json().catch(() => ({}))

    // Normalize token field names
    const token: string | undefined =
      body?.token || body?.verifyToken || body?.emailToken || body?.verificationToken

    if (!token) {
      return NextResponse.json(
        { message: "Verification token required" },
        { status: 400 }
      )
    }

    // Backend expects token as a query parameter, not in the body
    const endpoint = `${baseUrl}verify-email?token=${encodeURIComponent(token)}`

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })

    let data: any = null
    try {
      data = await res.json()
    } catch {
      data = { message: "No JSON body" }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}

// Optional GET support if verification link sends token as a query param
export async function GET(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      return NextResponse.json(
        { message: "Backend base URL not configured", cause: "config" },
        { status: 500 }
      )
    }
    const endpoint = `${baseUrl}verify-email`
    const { searchParams } = new URL(req.url)
    const token =
      searchParams.get("token") ||
      searchParams.get("verifyToken") ||
      searchParams.get("emailToken") ||
      undefined

    const res = await fetch(endpoint + (token ? `?token=${encodeURIComponent(token)}` : ""), {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    })

    let data: any = null
    try {
      data = await res.json()
    } catch {
      data = { message: "No JSON body" }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}