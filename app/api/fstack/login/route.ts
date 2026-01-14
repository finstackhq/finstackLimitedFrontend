import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const endpoint = baseUrl ? `${baseUrl}login` : undefined

  try {
    const body = await req.json()

    if (!endpoint) {
      console.error("[login] FINSTACK_BACKEND_API_URL not set")
      return NextResponse.json(
        { error: "Server is not configured: FINSTACK_BACKEND_API_URL missing" },
        { status: 500 }
      )
    }

    // Only forward the fields the backend expects
    const forwardBody = {
      email: body?.email,
      password: body?.password,
    }

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({ message: "No JSON body" }))

    const response = NextResponse.json(data, { status: res.status })
    // On successful login, set access token cookie for route protection
    const accessToken: string | undefined = (data as any)?.user?.accessToken
    if (res.ok && accessToken) {
      try {
        response.cookies.set("access_token", accessToken, {
          httpOnly: true,
          // Use secure cookies in production; allow non-secure on localhost dev
          secure: process.env.NODE_ENV === 'production',
          sameSite: "strict",
          path: "/",
          // 24 hours; align with backend token expiry if provided
          maxAge: 60 * 60 * 24,
        })
        console.log("[login] access_token cookie set")
      } catch (e) {
        console.warn("[login] failed to set access_token cookie:", (e as any)?.message || e)
      }
    }

    return response
  } catch (error: any) {
    console.error("[login] error:", error?.message || error)
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 })
  }
}
