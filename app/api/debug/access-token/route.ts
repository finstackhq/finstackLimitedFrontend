import { NextRequest, NextResponse } from 'next/server'

// Dev-only endpoint to read the HttpOnly access_token cookie
export async function GET(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1')
  const isProd = process.env.NODE_ENV === 'production'

  if (isProd && !isLocal) {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 })
  }

  const token = req.cookies.get('access_token')?.value || ''
  return NextResponse.json({ access_token: token })
}