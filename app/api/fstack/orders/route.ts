import { NextRequest, NextResponse } from 'next/server'

// GET /api/fstack/orders -> proxy to backend orders endpoint
export async function GET(request: NextRequest) {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL

    // Get query parameters from request
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '10'

    // Build query string
    const queryParams = new URLSearchParams()
    if (status) queryParams.append('status', status)
    queryParams.append('page', page)
    queryParams.append('limit', limit)

    const endpoint = baseUrl ? `${baseUrl}orders?${queryParams.toString()}` : undefined

    try {
        if (!endpoint) {
            console.error('[fstack/orders] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const token = request.cookies.get('access_token')?.value
        const res = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: 'no-store',
        })

        let data: any = null
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        console.log('[fstack/orders] GET status:', res.status)

        // Auto-logout on unauthorized
        if (res.status === 401) {
            const out = NextResponse.json(data, { status: 401 })
            try {
                out.cookies.delete('access_token')
            } catch { }
            return out
        }

        return NextResponse.json(data, { status: res.status })
    } catch (error: any) {
        console.error('[fstack/orders] GET error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}
