// import { NextRequest, NextResponse } from 'next/server';
// import { cookies } from 'next/headers';

// export async function POST(
//     req: NextRequest,
//     { params }: { params: { id: string } }
// ) {
//     try {
//         const cookieStore = await cookies();
//         const token = cookieStore.get('access_token')?.value;

//         if (!token) {
//             return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
//         }

//         const tradeId = params.id;
//         const { otpCode } = await req.json();

//         // Expect body to contain { otpCode: "123456" }

//         const backendUrl = `${process.env.FINSTACK_BACKEND_API_URL}trade/${tradeId}/confirm-release`;

//         const response = await fetch(backendUrl, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`,
//             },
//             body: JSON.stringify({ otpCode }),
//         });

//         const data = await response.json();
//         return NextResponse.json(data, { status: response.status });
//     } catch (error: any) {
//         console.error('Confirm release error:', error);
//         return NextResponse.json(
//             { success: false, message: error.message || 'Internal Server Error' },
//             { status: 500 }
//         );
//     }
// }

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: NextRequest,

  { params }: { params: Promise<{ id: string }> },
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

    const resolvedParams = await params;
    const tradeId = resolvedParams.id;

    const { otpCode } = await req.json();

    const backendUrl = `${process.env.FINSTACK_BACKEND_API_URL}trade/${tradeId}/confirm-release`;

    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ otpCode }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error("Confirm release error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal Server Error" },
      { status: 500 },
    );
  }
}
