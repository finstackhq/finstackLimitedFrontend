import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/logout -> proxy to backend logout and clear admin cookies
export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  const token = req.cookies.get('access_token')?.value

  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      // If base URL is not configured, clear cookies locally and return 500
      const res = NextResponse.json(
        { message: 'Backend base URL not configured', cause: 'config' },
        { status: 500 }
      )
      try {
        res.cookies.delete('access_token')
        res.cookies.set('admin_session', '', {
          path: '/admin',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      } catch {}
      return res
    }
    const endpoint = `${baseUrl}logout`
    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({}),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await upstream.json().catch(() => ({}))

    // Build response and always clear local admin cookies
    const res = NextResponse.json(
      data && Object.keys(data).length ? data : { message: 'Logged out' },
      { status: upstream.status }
    )
    try {
      // Clear global access token
      res.cookies.delete('access_token')
      // Ensure admin_session is cleared with matching path
      res.cookies.set('admin_session', '', {
        path: '/admin',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    } catch {}

    return res
  } catch (e: any) {
    clearTimeout(timeout)
    // On network/timeout errors, still clear cookies locally so admin is logged out client-side
    const res = NextResponse.json(
      { message: 'Logout failed upstream; local admin session cleared', cause: e?.name || 'network' },
      { status: 502 }
    )
    try {
      res.cookies.delete('access_token')
      res.cookies.set('admin_session', '', {
        path: '/admin',
        maxAge: 0,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    } catch {}
    return res
  }
}