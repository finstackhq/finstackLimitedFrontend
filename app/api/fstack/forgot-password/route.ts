import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      return NextResponse.json(
        { message: "Backend base URL not configured", cause: "config" },
        { status: 500 }
      )
    }
    const endpoint = `${baseUrl}forgot-password`

    const body = await req.json()
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
