import { NextRequest, NextResponse } from 'next/server'

// POST /api/admin/set-fees -> set transaction fees (P2P, DEPOSIT, WITHDRAW)
export async function POST(request: NextRequest) {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL

    try {
        if (!baseUrl) {
            console.error('[admin/set-fees] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const body = await request.json()
        const { type, currency, targetCurrency, feeAmount } = body

        // Validate required fields
        if (!type || !currency || feeAmount === undefined) {
            return NextResponse.json({
                error: 'type, currency, and feeAmount are required'
            }, { status: 400 })
        }

        // Validate fee type
        if (!['P2P', 'DEPOSIT', 'WITHDRAW'].includes(type)) {
            return NextResponse.json({
                error: 'type must be P2P, DEPOSIT, or WITHDRAW'
            }, { status: 400 })
        }

        // P2P requires targetCurrency
        if (type === 'P2P' && !targetCurrency) {
            return NextResponse.json({
                error: 'targetCurrency is required for P2P fees'
            }, { status: 400 })
        }

        const endpoint = `${baseUrl}admin/fees-update`

        const token = request.cookies.get('access_token')?.value
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ type, currency, targetCurrency, feeAmount }),
            cache: 'no-store',
        })

        let data: any = null
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        console.log('[admin/set-fees] POST status:', res.status)

        // Auto-logout on unauthorized
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
        console.error('[admin/set-fees] POST error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to set fees' },
            { status: 500 }
        )
    }
}
