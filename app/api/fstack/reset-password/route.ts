import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    if (!baseUrl) {
      return NextResponse.json(
        { message: 'Backend base URL not configured', cause: 'config' },
        { status: 500 }
      )
    }
    const endpoint = `${baseUrl}reset-password`

    const body = await req.json()

    const upstream = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    const data = await upstream.json().catch(() => ({}))

    if (!upstream.ok) {
      return NextResponse.json(
        { message: data?.message || 'Reset password failed', cause: 'upstream_error' },
        { status: upstream.status }
      )
    }

    return NextResponse.json(data)
  } catch (e: any) {
    clearTimeout(timeout)
    if (e?.name === 'AbortError') {
      return NextResponse.json(
        { message: 'Upstream timeout', cause: 'timeout' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      { message: 'Upstream fetch failed', cause: 'network' },
      { status: 502 }
    )
  }
}
