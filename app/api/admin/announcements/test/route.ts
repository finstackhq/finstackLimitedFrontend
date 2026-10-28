import { NextRequest, NextResponse } from "next/server";
import {
  announcementContent,
  proxyAdminAnnouncementRequest,
  validateAnnouncementContent,
} from "@/lib/server/admin-announcements";

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

  return proxyAdminAnnouncementRequest(
    request,
    "admin/announcements/test",
    {
      method: "POST",
      body: announcementContent(payload as Record<string, unknown>),
    },
  );
}
