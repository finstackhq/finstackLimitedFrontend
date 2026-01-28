import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
        console.log('[fstack/p2p/cancel] FINSTACK_BACKEND_API_URL:', baseUrl);

        if (!baseUrl) {
            console.error('[fstack/p2p/cancel] FINSTACK_BACKEND_API_URL not set');
            return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
        }

        // Get token from cookies (matching other routes pattern)
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        console.log('[fstack/p2p/cancel] Token found:', !!token);

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { tradeId } = body;

        console.log('[fstack/p2p/cancel] Trade ID:', tradeId);

        if (!tradeId) {
            return NextResponse.json({ success: false, error: 'Trade ID is required' }, { status: 400 });
        }

        // Backend endpoint: https://finstacklimitedbackend.onrender.com/api/trade/{id}/cancel
        const apiUrl = `${baseUrl}trade/${tradeId}/cancel`;

        console.log(`[fstack/p2p/cancel] Full URL: ${apiUrl}`);

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        console.log('[fstack/p2p/cancel] Response status:', response.status);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data;

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
            console.log('[fstack/p2p/cancel] Response data:', data);
        } else {
            const text = await response.text();
            console.error('[fstack/p2p/cancel] Non-JSON response:', text.substring(0, 500));
            return NextResponse.json({
                success: false,
                error: text || 'Backend returned non-JSON response'
            }, { status: response.status });
        }

        if (!response.ok) {
            console.error('[fstack/p2p/cancel] Backend cancellation failed:', data);
            return NextResponse.json({
                success: false,
                error: data.message || 'Failed to cancel trade'
            }, { status: response.status });
        }

        return NextResponse.json({ success: true, ...data });

    } catch (error: any) {
        console.error('[fstack/p2p/cancel] Error:', error.message);
        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
