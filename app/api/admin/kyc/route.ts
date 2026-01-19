import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/kyc -> proxy to backend getAllKycs
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const endpoint = baseUrl ? `${baseUrl}admin/getAllKycs` : undefined
  try {
    if (!endpoint) {
      console.error('[admin/kyc] FINSTACK_BACKEND_API_URL not set')
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
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
    console.log('[admin/kyc] getAllKycs status:', res.status)
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
      } catch { }
      return out
    }
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('[admin/kyc] GET error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to fetch KYC requests' }, { status: 500 })
  }
}

// PUT /api/admin/kyc -> proxy to backend updateKyc with { id, status, reason? }
export async function PUT(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL
  const endpoint = baseUrl ? `${baseUrl}admin/updateKyc` : undefined
  try {
    const body = await request.json()
    const id = body?.id
    const status = body?.status
    const reason = body?.reason // Optional rejection reason
    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    if (!endpoint) {
      console.error('[admin/kyc] FINSTACK_BACKEND_API_URL not set')
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
    }

    const token = request.cookies.get('access_token')?.value

    // Build request body, include reason if provided
    const requestBody: { id: string; status: string; reason?: string } = { id, status }
    if (reason) {
      requestBody.reason = reason
    }

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
    })

    const data = await res.json().catch(() => ({ message: 'No JSON body' }))
    console.log('[admin/kyc] updateKyc status:', res.status, ' id=', id, ' status=', status, reason ? ` reason=${reason}` : '')
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
      } catch { }
      return out
    }
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    console.error('[admin/kyc] PUT error:', error?.message || error)
    return NextResponse.json({ error: error?.message || 'Failed to update KYC' }, { status: 500 })
  }
}