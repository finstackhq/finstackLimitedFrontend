import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> },
) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, error: "Backend URL not configured" },
      { status: 500 },
    )
  }

  try {
    const { adId } = await params
    const body = await request.json()
    const token = request.headers.get("Authorization") ||
      (request.cookies.get("access_token")?.value
        ? `Bearer ${request.cookies.get("access_token")?.value}`
        : undefined)
    const apiBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
    const response = await fetch(`${apiBase}trade/initiate/${encodeURIComponent(adId)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify(body),
      cache: "no-store",
    })

    const data = await response.json().catch(() => null)
    if (!data) {
      return NextResponse.json(
        { success: false, error: `Backend returned ${response.status}` },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in trade initiation proxy:", error)
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    )
  }
}