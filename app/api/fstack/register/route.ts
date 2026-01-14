import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const endpoint = baseUrl ? `${baseUrl}register` : undefined

  try {
    const body = await req.json()

    // Only forward the fields the backend expects
    const forwardBody = {
      firstName: body?.firstName,
      lastName: body?.lastName,
      email: body?.email,
      password: body?.password,
      howYouHeardAboutUs: body?.howYouHeardAboutUs,
    }

    if (!endpoint) {
      console.error("[register] FINSTACK_BACKEND_API_URL not set")
      return NextResponse.json(
        { error: "Server is not configured: FINSTACK_BACKEND_API_URL missing" },
        { status: 500 }
      )
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "No JSON body" }))

    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}
