import { NextResponse } from "next/server"
import { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      return NextResponse.json(
        { success: false, message: "Backend URL not configured" },
        { status: 500 },
      )
    }

    const queryString = request.nextUrl.searchParams.toString()

    // The env var already includes /api/, so we append ads/convert
    const apiUrl = `${baseUrl}ads/convert?${queryString}`

    const token =
      request.headers.get("Authorization") ||
      (request.cookies.get("access_token")?.value
        ? `Bearer ${request.cookies.get("access_token")?.value}`
        : undefined)

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      cache: "no-store",
    })

    const data = await response.json().catch(() => null)
    if (!data) {
      const message =
        response.status === 429
          ? "Too many requests. Please wait a moment and try again."
          : `Something went wrong (${response.status}). Please try again.`
      return NextResponse.json({ success: false, message }, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in converter ads proxy:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    )
  }
}