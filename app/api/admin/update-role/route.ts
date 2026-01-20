import { NextRequest, NextResponse } from 'next/server'

// PUT /api/admin/update-role -> proxy to backend update-user-role
export async function PUT(request: NextRequest) {
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL
    const endpoint = baseUrl ? `${baseUrl}admin/update-user-role` : undefined

    try {
        const body = await request.json()
        const userId = body?.userId
        const role = body?.role

        if (!userId || !role) {
            return NextResponse.json({ error: 'userId and role are required' }, { status: 400 })
        }

        // Validate role is one of the allowed values
        const allowedRoles = ['admin', 'merchant', 'user']
        if (!allowedRoles.includes(role.toLowerCase())) {
            return NextResponse.json({ error: 'Invalid role. Must be admin, merchant, or user' }, { status: 400 })
        }

        if (!endpoint) {
            console.error('[admin/update-role] FINSTACK_BACKEND_API_URL not set')
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
        }

        const token = request.cookies.get('access_token')?.value

        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ userId, role }),
            cache: 'no-store',
        })

        const data = await res.json().catch(() => ({ message: 'No JSON body' }))
        console.log('[admin/update-role] status:', res.status, ' userId=', userId, ' role=', role)

        // If unauthorized, clear cookies so admin is logged out automatically
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
        console.error('[admin/update-role] PUT error:', error?.message || error)
        return NextResponse.json({ error: error?.message || 'Failed to update user role' }, { status: 500 })
    }
}
