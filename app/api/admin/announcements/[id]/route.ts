import { NextRequest, NextResponse } from "next/server";
import { proxyAdminAnnouncementRequest } from "@/lib/server/admin-announcements";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { success: false, error: "Announcement ID is required." },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams();
  for (const key of ["page", "limit"] as const) {
    const value = searchParams.get(key);
    if (value) query.set(key, value);
  }

  const status = searchParams.get("status");
  if (status && status !== "sent" && status !== "failed") {
    return NextResponse.json(
      { success: false, error: "Status must be sent or failed." },
      { status: 400 },
    );
  }
  if (status) query.set("status", status);

  const includeFailedRecipients =
    status === "failed" && searchParams.get("includeRecipients") === "true";

  return proxyAdminAnnouncementRequest(
    request,
    `admin/announcements/${encodeURIComponent(id)}`,
    {
      method: "GET",
      query,
      includeFailedRecipients,
    },
  );
}
