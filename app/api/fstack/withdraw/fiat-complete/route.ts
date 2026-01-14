import { NextRequest, NextResponse } from 'next/server'

const baseUrl = process.env.FINSTACK_BACKEND_API_URL

// POST /api/fstack/withdraw/fiat-complete -> complete fiat withdrawal with OTP
export async function POST(request: NextRequest) {
    try {
        if (!baseUrl) {
            console.error('[fstack/withdraw/fiat-complete] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const body = await request.json()
        const {
            walletCurrency,
            fiatCurrency,
            amount,
            otpCode,
            destinationAccountNumber,
            institutionCode,
            accountName
        } = body

        // Validate required fields
        if (!walletCurrency || !fiatCurrency || !amount || !otpCode || !destinationAccountNumber || !institutionCode || !accountName) {
            return NextResponse.json({
                error: 'All fields are required: walletCurrency, fiatCurrency, amount, otpCode, destinationAccountNumber, institutionCode, accountName'
            }, { status: 400 })
        }

        const endpoint = `${baseUrl}withdraw/fiatComplete`

        const token = request.cookies.get('access_token')?.value
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
                walletCurrency,
                fiatCurrency,
                amount,
                otpCode,
                destinationAccountNumber,
                institutionCode,
                accountName
            }),
            cache: 'no-store',
        })

        let data: any = null
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        console.log('[fstack/withdraw/fiat-complete] POST status:', res.status)

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
        console.error('[fstack/withdraw/fiat-complete] POST error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to complete fiat withdrawal' },
            { status: 500 }
        )
    }
}
