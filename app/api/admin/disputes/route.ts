import { NextRequest, NextResponse } from 'next/server'

// GET /api/admin/disputes -> fetch disputes
export async function GET(request: NextRequest) {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL

    try {
        if (!baseUrl) {
            console.error('[admin/disputes] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        // Get query parameters
        const { searchParams } = new URL(request.url)
        const page = searchParams.get('page') || '1'
        const limit = searchParams.get('limit') || '20'

        // Build query string
        const queryParams = new URLSearchParams()
        queryParams.append('page', page)
        queryParams.append('limit', limit)

        const endpoint = `${baseUrl}admin/disputes?${queryParams.toString()}`

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

        console.log('[admin/disputes] GET status:', res.status)

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
        console.error('[admin/disputes] GET error:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch disputes' },
            { status: 500 }
        )
    }
}
