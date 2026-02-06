
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://finstacklimitedbackend.onrender.com';

        // Forward the FormData to the backend
        const response = await fetch(`${backendUrl}/api/upload-alipay-qr`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                // Note: When sending FormData, do NOT set 'Content-Type': 'multipart/form-data'.
                // The browser/fetch automatically sets it with the correct boundary.
            },
            body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: data.message || 'Failed to upload QR code' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error uploading Alipay QR code:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
