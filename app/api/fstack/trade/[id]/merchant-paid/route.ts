import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // 1. Change type to Promise
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: tradeId } = await params;

    const backendUrl = `${process.env.FINSTACK_BACKEND_API_URL}trade/${tradeId}/merchant-paid`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Merchant paid error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
