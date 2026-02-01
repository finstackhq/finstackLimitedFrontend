import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

        const body = await request.json().catch(() => ({}));

        const response = await fetch(`${BACKEND_URL}trade/${tradeId}/dispute`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(body),
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
