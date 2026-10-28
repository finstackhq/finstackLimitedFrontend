import { NextRequest, NextResponse } from "next/server";
import {
  announcementContent,
  proxyAdminAnnouncementRequest,
  validateAnnouncementContent,
} from "@/lib/server/admin-announcements";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams();
  for (const key of ["page", "limit"] as const) {
    const value = searchParams.get(key);
    if (value) query.set(key, value);
  }

  return proxyAdminAnnouncementRequest(request, "admin/announcements", {
    method: "GET",
    query,
  });
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "A valid JSON request body is required." },
      { status: 400 },
    );
  }

  const validationError = validateAnnouncementContent(payload);
  if (validationError) {
    return NextResponse.json(
      { success: false, error: validationError },
      { status: 400 },
    );
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    (payload as Record<string, unknown>).confirmSendToAll !== true
  ) {
    return NextResponse.json(
      {
        success: false,
        error: "Explicit confirmation is required to send to all users.",
      },
      { status: 400 },
    );
  }

  return proxyAdminAnnouncementRequest(request, "admin/announcements", {
    method: "POST",
    body: {
      ...announcementContent(payload as Record<string, unknown>),
      confirmSendToAll: true,
    },
  });
}
