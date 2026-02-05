
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ tradeId: string }> }
) {
    try {
        const { tradeId } = await params;
        const body = await request.json();
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finstacklimitedbackend.onrender.com';
        const response = await fetch(`${backendUrl}/api/admin/trades/${tradeId}/resolve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.message || 'Failed to resolve dispute' },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true, data });
    } catch (error: any) {
        console.error('Error resolving dispute:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
