import { NextRequest, NextResponse } from 'next/server'

const baseUrl = process.env.FINSTACK_BACKEND_API_URL

// GET /api/fstack/profile -> fetch user profile
export async function GET(request: NextRequest) {
    try {
        if (!baseUrl) {
            console.error('[fstack/profile] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        let endpoint = `${baseUrl}me`;

        if (type === 'bank-accounts') {
            endpoint = `${baseUrl}my-bank-accounts`;
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

        console.log('[fstack/profile] GET status:', res.status)

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
        console.error('[fstack/profile] GET error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch profile' },
            { status: 500 }
        )
    }
}

// PATCH /api/fstack/profile -> update user profile
export async function PATCH(request: NextRequest) {
    try {
        if (!baseUrl) {
            console.error('[fstack/profile] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const body = await request.json()
        const { firstName, lastName, phoneNumber } = body

        if (!firstName || !lastName) {
            return NextResponse.json({
                error: 'firstName and lastName are required'
            }, { status: 400 })
        }

        const endpoint = `${baseUrl}update-me`
        const token = request.cookies.get('access_token')?.value

        const res = await fetch(endpoint, {
            method: 'PATCH',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ firstName, lastName, phoneNumber }),
            cache: 'no-store',
        })

        let data: any = null
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        console.log('[fstack/profile] PATCH status:', res.status)

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
        console.error('[fstack/profile] PATCH error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update profile' },
            { status: 500 }
        )
    }
}

// PUT /api/fstack/profile -> add bank account
export async function PUT(request: NextRequest) {
    try {
        if (!baseUrl) {
            console.error('[fstack/profile] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const body = await request.json()

        const endpoint = `${baseUrl}bank-account`
        const token = request.cookies.get('access_token')?.value

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
            cache: 'no-store',
        })

        let data: any = null
        try {
            data = await res.json()
        } catch {
            data = {}
        }

        console.log('[fstack/profile] PUT status:', res.status)

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
        console.error('[fstack/profile] PUT error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to add bank account' },
            { status: 500 }
        )
    }
}
