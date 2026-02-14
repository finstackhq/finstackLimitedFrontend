
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const endpoint = baseUrl ? `${baseUrl}login` : undefined;

  try {
    const body = await req.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Server is not configured: FINSTACK_BACKEND_API_URL missing" },
        { status: 500 },
      );
    }

    const forwardBody = {
      email: body?.email,
      password: body?.password,
    };

    const backendRes = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forwardBody),
      credentials: "include",
      cache: "no-store",
    });

    const data = await backendRes
      .json()
      .catch(() => ({ message: "No JSON body" }));
    const response = NextResponse.json(data, { status: backendRes.status });

    // Copy set-cookie header from backend to browser
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) {
      response.headers.set("set-cookie", setCookie);
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}
