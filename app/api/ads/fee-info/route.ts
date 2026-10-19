import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  if (!baseUrl) {
    return NextResponse.json(
      { success: false, message: "Backend URL not configured" },
      { status: 500 },
    )
  }

  try {
    const queryString = request.nextUrl.searchParams.toString()
    const token = request.headers.get("Authorization") ||
      (request.cookies.get("access_token")?.value
        ? `Bearer ${request.cookies.get("access_token")?.value}`
        : undefined)
    const response = await fetch(`${baseUrl}ads/fee-info?${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      cache: "no-store",
    })

    const data = await response.json().catch(() => null)
    if (!data) {
      return NextResponse.json(
        { success: false, message: `Something went wrong (${response.status}). Please try again.` },
        { status: response.status },
      )
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Error in fee info proxy:", error)
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 },
    )
  }
}