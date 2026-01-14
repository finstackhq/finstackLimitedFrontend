import { NextRequest, NextResponse } from 'next/server'

// POST /api/fstack/p2p/confirm-payment -> confirm buyer payment for a trade
export async function POST(request: NextRequest) {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL

    try {
        if (!baseUrl) {
            console.error('[fstack/p2p/confirm-payment] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const body = await request.json()
        const { reference } = body

        if (!reference) {
            return NextResponse.json({ error: 'Trade reference is required' }, { status: 400 })
        }

        // Build endpoint: trade/{reference}/confirm-buyer-payment
        const endpoint = `${baseUrl}trade/${reference}/confirm-buyer-payment`

        const token = request.cookies.get('access_token')?.value
        const res = await fetch(endpoint, {
            method: 'POST',
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

        console.log('[fstack/p2p/confirm-payment] POST status:', res.status, 'reference:', reference)

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
        console.error('[fstack/p2p/confirm-payment] POST error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to confirm payment' },
            { status: 500 }
        )
    }
}
