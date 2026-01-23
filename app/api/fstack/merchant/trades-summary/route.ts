import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
        if (!baseUrl) {
            return NextResponse.json({ success: false, error: 'Backend URL not configured' }, { status: 500 });
        }

        const token = req.cookies.get('access_token')?.value || req.cookies.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized: No access token found' }, { status: 401 });
        }

        const apiUrl = `${baseUrl}trades-summary`;

        console.log('[API] Fetching trades summary from:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            cache: 'no-store'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to fetch trades summary from backend:', response.status, errorText);
            return NextResponse.json({ success: false, error: `Backend returned ${response.status}: ${errorText}` }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('Error in trades summary proxy:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
