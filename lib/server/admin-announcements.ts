import { NextRequest, NextResponse } from "next/server";
import {
  announcementContent,
  omitAnnouncementRecipients,
  validateAnnouncementContent,
} from "@/lib/admin/announcement-utils.mjs";

export {
  announcementContent,
  omitAnnouncementRecipients,
  validateAnnouncementContent,
};

interface ProxyOptions {
  method: "GET" | "POST";
  body?: unknown;
  query?: URLSearchParams;
  includeFailedRecipients?: boolean;
}

function unauthorizedResponse() {
  const response = NextResponse.json(
    { success: false, error: "Admin authentication is required." },
    { status: 401 },
  );
  response.cookies.delete("access_token");
  response.cookies.set("admin_session", "", {
    path: "/admin",
    maxAge: 0,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function proxyAdminAnnouncementRequest(
  request: NextRequest,
  endpointPath: string,
  { method, body, query, includeFailedRecipients = false }: ProxyOptions,
) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  if (!baseUrl) {
    console.error("[admin/announcements] FINSTACK_BACKEND_API_URL not set");
    return NextResponse.json(
      { success: false, error: "Server is not configured." },
      { status: 500 },
    );
  }

  const token = request.cookies.get("access_token")?.value;
  if (!token) return unauthorizedResponse();

  try {
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    const endpoint = new URL(endpointPath, normalizedBaseUrl);
    if (query) endpoint.search = query.toString();

    const upstreamResponse = await fetch(endpoint, {
      method,
      headers: {
        Accept: "application/json",
        ...(method === "POST" ? { "Content-Type": "application/json" } : {}),
        Authorization: `Bearer ${token}`,
      },
      ...(method === "POST" ? { body: JSON.stringify(body) } : {}),
      cache: "no-store",
    });

    const responseText = await upstreamResponse.text();
    let responseData: unknown;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      console.error(
        "[admin/announcements] Backend returned an invalid JSON response",
      );
      return NextResponse.json(
        { success: false, error: "The backend returned an invalid response." },
        { status: 502 },
      );
    }

    if (upstreamResponse.status === 401) return unauthorizedResponse();

    const safeResponse = includeFailedRecipients
      ? responseData
      : omitAnnouncementRecipients(responseData);
    return NextResponse.json(safeResponse, { status: upstreamResponse.status });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[admin/announcements] Backend request failed:", message);
    return NextResponse.json(
      { success: false, error: "Could not reach the announcements service." },
      { status: 502 },
    );
  }
}
