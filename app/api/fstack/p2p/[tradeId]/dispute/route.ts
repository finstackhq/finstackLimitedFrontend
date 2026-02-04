import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Helper to get backend URL
const BACKEND_URL = process.env.FINSTACK_BACKEND_API_URL || "https://finstacklimitedbackend.onrender.com/api/";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ tradeId: string }> }
) {
    try {
        const { tradeId } = await params;

        const cookieStore = await cookies();
        const accessToken = cookieStore.get("access_token")?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Parse FormData from request
        let formData;
        try {
            formData = await request.formData();
        } catch (e: any) {
            console.error("Failed to parse formData:", e);
            const contentType = request.headers.get("content-type");
            return NextResponse.json(
                {
                    success: false,
                    error: "Invalid content type or body",
                    details: e.message,
                    receivedContentType: contentType
                },
                { status: 400 }
            );
        }

        if (!formData) {
            return NextResponse.json(
                { success: false, error: "Invalid content type, expected multipart/form-data (formData is null)" },
                { status: 400 }
            );
        }

        // Forward to backend
        // Note: When passing FormData to fetch, do NOT set Content-Type header manually.
        const response = await fetch(`${BACKEND_URL}trade/${tradeId}/dispute`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: data.message || data.error || "Failed to submit dispute",
                    details: data
                },
                { status: response.status }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Dispute submitted successfully",
            data,
        });
    } catch (error: any) {
        console.error("[dispute] Error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}
