import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    // The user strictly requested: http://finstacklimitedbackend.onrender.com/api/my-orders
    // We should use the environment variable if possible, but fallback to the hardcoded url if needed to match instruction exactly, 
    // or better, append /my-orders to the base URL as requested.

    // Assuming FINSTACK_BACKEND_API_URL is "http://finstacklimitedbackend.onrender.com/api/" or similar.
    // However, the user said: "http://finstacklimitedbackend.onrender.com/api/my-orders this is the endpoint ti target please use the env var then apppend"

    const baseUrl = process.env.FINSTACK_BACKEND_API_URL

    // We need to construct the URL. If env var is "http://.../api/", we append "my-orders".
    // If it is "http://.../api", we append "/my-orders".

    let endpoint = ''
    if (baseUrl) {
        endpoint = baseUrl.endsWith('/') ? `${baseUrl}my-orders` : `${baseUrl}/my-orders`
    } else {
        // Fallback or error? The user said "use the env var".
        // I will log an error if not found, but for safety I might check if I can use the hardcoded one as fallback if env is missing?
        // User said "please use the env var". I will stick to that.
        console.error('FINSTACK_BACKEND_API_URL is not defined')
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    try {
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
        } catch (e) {
            console.error('Failed to parse JSON:', e)
            data = {}
        }

        if (res.status === 401) {
            // Token expired or invalid
            const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            // Optionally clear cookie here if desired, but maybe just let the frontend handle redirect
            return response
        }

        if (!res.ok) {
            return NextResponse.json(data, { status: res.status })
        }

        return NextResponse.json(data, { status: 200 })

    } catch (error: any) {
        console.error('[fstack/my-orders] Error:', error)
        return NextResponse.json(
            { error: error?.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}
