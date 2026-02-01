import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
    // Use the confirmed working endpoint for my-orders
    const listEndpoint = baseUrl?.endsWith('/') ? `${baseUrl}my-orders` : `${baseUrl}/my-orders`;

    try {
        // Fetch all orders
        const response = await fetch(
            listEndpoint,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                cache: 'no-store'
            }
        );

        if (!response.ok) {
            // If listing fails, we can't find the order
            return NextResponse.json(
                { error: "Failed to fetch orders list" },
                { status: response.status }
            );
        }

        const data = await response.json();
        let orders = [];

        // Handle various response structures
        if (Array.isArray(data)) {
            orders = data;
        } else if (Array.isArray(data?.data)) {
            orders = data.data;
        } else if (Array.isArray(data?.trades)) {
            orders = data.trades;
        }

        // Find the specific order by reference or ID
        const order = orders.find((o: any) => o.reference === id || o._id === id);

        if (!order) {
            return NextResponse.json(
                { error: "Order not found" },
                { status: 404 }
            );
        }

        // Return the single order wrapped in expected success format or directly
        return NextResponse.json({ success: true, data: order });

    } catch (error) {
        console.error("Fetch order error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
