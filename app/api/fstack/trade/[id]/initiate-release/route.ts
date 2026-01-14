import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('access_token')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const tradeId = params.id;
        // The user provided endpoint structure: https://finstack-backend-api.onrender.com/api/trade/P2P-1767112468832/initiate-release
        // Here tradeId (from folder [id]) corresponds to the reference (e.g., P2P-...)

        // However, the folder logic usually captures the ID from the URL path. 
        // If the frontend calls /api/fstack/trade/P2P-123/initiate-release, params.id is P2P-123.

        const backendUrl = `${process.env.FINSTACK_BACKEND_API_URL}trade/${tradeId}/initiate-release`;

        const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Initiate release error:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
