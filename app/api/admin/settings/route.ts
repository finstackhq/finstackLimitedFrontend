import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Mock settings data - replace with actual API calls
    const settings = {
      systemToggles: {
        depositsEnabled: true,
        withdrawalsEnabled: true,
        p2pTransfersEnabled: true,
        kycRequired: true,
      },
    };

    return NextResponse.json(settings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { type, data } = await request.json();

    if (type === "toggle") {
      const { setting, value } = data;
      return NextResponse.json({
        success: true,
        message: "Setting updated successfully",
      });
    }

    if (type === "password") {
      const { currentPassword, newPassword } = data;
      // Mock password change - replace with actual implementation
      return NextResponse.json({
        success: true,
        message: "Password changed successfully",
      });
    }

    return NextResponse.json(
      { error: "Invalid request type" },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
