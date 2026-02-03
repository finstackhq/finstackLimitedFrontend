import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,

  { params }: { params: Promise<{ id: string }> },
) {
  const token = req.cookies.get("access_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Await the params before destructuring
  const { id } = await params;

  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const listEndpoint = baseUrl?.endsWith("/")
    ? `${baseUrl}my-orders`
    : `${baseUrl}/my-orders`;

  try {
    const response = await fetch(listEndpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch orders list" },
        { status: response.status },
      );
    }

    const data = await response.json();
    let orders = [];

    if (Array.isArray(data)) {
      orders = data;
    } else if (Array.isArray(data?.data)) {
      orders = data.data;
    } else if (Array.isArray(data?.trades)) {
      orders = data.trades;
    }

    const order = orders.find((o: any) => o.reference === id || o._id === id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
