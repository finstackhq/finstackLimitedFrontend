import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  if (!baseUrl) {
    return NextResponse.json(
      { error: "Registration options are temporarily unavailable." },
      { status: 500 },
    );
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/registration-options`;

  try {
    const backendRes = await fetch(endpoint, { cache: "no-store" });
    const data = await backendRes
      .json()
      .catch(() => ({ error: "Invalid response from registration service." }));

    return NextResponse.json(data, { status: backendRes.status });
  } catch {
    return NextResponse.json(
      { error: "Unable to connect to the registration service." },
      { status: 500 },
    );
  }
}