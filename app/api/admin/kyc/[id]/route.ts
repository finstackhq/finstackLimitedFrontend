import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/kyc/[id] -> proxy to backend getSingleKyc/:id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const id = params?.id
  const endpoint = baseUrl && id ? `${baseUrl}admin/getSingleKyc/${id}` : undefined

  try {
    if (!endpoint) {
      console.error('[admin/kyc/:id] FINSTACK_BACKEND_API_URL not set or id missing')
      return NextResponse.json({ error: 'Server not configured or id missing' }, { status: 500 })
    }

    const token = request.cookies.get('access_token')?.value
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({ message: 'No JSON body' }))
    console.log('[admin/kyc/:id] getSingleKyc status:', res.status, ' id=', id)
    // If unauthorized, clear cookies so admin is logged out automatically
    if (res.status === 401) {
      const out = NextResponse.json(data, { status: 401 })
      try {
        out.cookies.delete('access_token')
        out.cookies.set('admin_session', '', {
          path: '/admin',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        })
      } catch {}
      return out
    }
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('[admin/kyc/:id] GET error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch KYC' }, { status: 500 })
  }
}