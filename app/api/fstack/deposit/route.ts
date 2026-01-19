import { NextRequest, NextResponse } from "next/server"

// GET /api/fstack/deposit - Proxy to backend deposit endpoint
// Supports ?type=wallet to fetch virtual account details from getWallet endpoint
export async function GET(request: NextRequest) {
    try {
        const baseUrl = process.env.FINSTACK_BACKEND_API_URL
        if (!baseUrl) {
            console.error('[fstack/deposit] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url)
        const type = searchParams.get('type')
        const currency = searchParams.get('currency') || 'USDC'

        // If type=wallet, fetch virtual account details from getWallet endpoint
        let endpoint: string
        if (type === 'wallet') {
            endpoint = `${baseUrl}getWallet`
        } else {
            endpoint = `${baseUrl}deposit?currency=${encodeURIComponent(currency)}`
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

        console.log('[fstack/deposit] GET status:', res.status, type === 'wallet' ? 'type: wallet' : `currency: ${currency}`)

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
        console.error('[fstack/deposit] GET error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch deposit address' },
            { status: 500 }
        )
    }
}
