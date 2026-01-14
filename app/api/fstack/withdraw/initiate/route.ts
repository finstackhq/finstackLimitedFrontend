import { NextRequest, NextResponse } from 'next/server'

const baseUrl = process.env.FINSTACK_BACKEND_API_URL

// POST /api/fstack/withdraw/initiate -> initiate withdrawal (sends OTP)
export async function POST(request: NextRequest) {
    try {
        if (!baseUrl) {
            console.error('[fstack/withdraw] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const body = await request.json()
        const { walletCurrency, amount } = body

        if (!walletCurrency || !amount) {
            return NextResponse.json({ error: 'walletCurrency and amount are required' }, { status: 400 })
        }

        const endpoint = `${baseUrl}withdraw/initiate`

        const token = request.cookies.get('access_token')?.value
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ walletCurrency, amount }),
            cache: 'no-store',
        })

        let data: any = null
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        console.log('[fstack/withdraw/initiate] POST status:', res.status)

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
        console.error('[fstack/withdraw/initiate] POST error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to initiate withdrawal' },
            { status: 500 }
        )
    }
}
