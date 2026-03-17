import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/users -> proxy to backend admin/users and normalize shape
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const endpoint = baseUrl ? `${baseUrl}admin/users` : undefined;

  try {
    if (!endpoint) {
      return NextResponse.json(
        { error: "Server not configured" },
        { status: 500 },
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "20";

    // Forward pagination and known backend filters to keep backend pagination authoritative.
    const upstreamParams = new URLSearchParams();
    upstreamParams.set("page", page);
    upstreamParams.set("limit", limit);

    const role = searchParams.get("role");
    const isVerified = searchParams.get("isVerified");
    const status = searchParams.get("status");
    const kycStatus = searchParams.get("kycStatus");
    if (role) upstreamParams.set("role", role);
    if (isVerified) upstreamParams.set("isVerified", isVerified);
    if (status && status !== "all") upstreamParams.set("status", status);
    if (kycStatus && kycStatus !== "all") {
      upstreamParams.set("kycStatus", kycStatus);
    }

    const token = request.cookies.get("access_token")?.value;
    const res = await fetch(`${endpoint}?${upstreamParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    let upstream: any = null;
    try {
      upstream = await res.json();
    } catch {
      upstream = {};
    }

    // Auto-logout on unauthorized: clear admin cookies
    if (res.status === 401) {
      const out = NextResponse.json(upstream, { status: 401 });
      try {
        out.cookies.delete("access_token");
        out.cookies.set("admin_session", "", {
          path: "/admin",
          maxAge: 0,
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      } catch {}
      return out;
    }

    const list = Array.isArray(upstream?.users)
      ? upstream.users
      : Array.isArray(upstream?.data)
        ? upstream.data
        : Array.isArray(upstream)
          ? upstream
          : [];

    // Normalize to frontend User shape
    type NormalizedUser = {
      id: string;
      name: string;
      email: string;
      country: string;
      balance: number;
      currency: string;
      kycStatus: string;
      status: string;
      joinedAt: string;
      role?: string;
      balances?: any[];
      totalBalance?: number;
    };

    // Helper function to extract total balance from various payload structures
    const extractBalance = (u: any): number => {
      // Try totalBalance field first (from backend)
      if (u?.totalBalance !== undefined) {
        return Number(u.totalBalance) || 0;
      }
      // Try wallet.totalBalance
      if (u?.wallet?.totalBalance !== undefined) {
        return Number(u.wallet.totalBalance) || 0;
      }
      // Sum from balances array with balance.total structure
      if (Array.isArray(u?.balances)) {
        return u.balances.reduce((sum: number, b: any) => {
          // Handle balance as object with total field
          if (b?.balance?.total !== undefined) {
            return sum + (Number(b.balance.total) || 0);
          }
          // Handle balance as direct number
          return sum + (Number(b?.balance) || 0);
        }, 0);
      }
      // Try balance.total object
      if (u?.balance?.total !== undefined) {
        return Number(u.balance.total) || 0;
      }
      // Try direct balance field
      if (u?.balance !== undefined && typeof u?.balance !== "object") {
        return Number(u.balance) || 0;
      }
      return 0;
    };

    let users: NormalizedUser[] = list.map((u: any) => ({
      id: String(u?._id || u?.id || ""),
      name:
        typeof u?.fullname === "string" && u.fullname.trim().length
          ? u.fullname
          : `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
            u.email?.split("@")[0] ||
            "—",
      // firstName:
      //   typeof u?.firstName === "string" && u.firstName.trim().length
      //     ? u.firstName
      //     : "",
      // lastName:
      //   typeof u?.lastName === "string" && u.lastName.trim().length
      //     ? u.lastName
      //     : "",
      // fullname:
      //   typeof u?.fullname === "string" && u.fullname.trim().length
      //     ? u.fullname
      //     : (typeof u?.firstName === "string" && u.firstName.trim().length) ||
      //         (typeof u?.lastName === "string" && u.lastName.trim().length)
      //       ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
      //       : typeof u?.name === "string" && u.name.trim().length
      //         ? u.name
      //         : typeof u?.email === "string"
      //           ? u.email.split("@")[0]
      //           : "—",
      email: String(u?.email || "—"),
      country: String(u?.country || "—"),
      balance: extractBalance(u),
      currency: String(u?.currency || "NGN"),
      kycStatus: String(u?.kycStatus || "not_required").toLowerCase(),
      status: String(u?.status || "active"),
      joinedAt: String(u?.createdAt || u?.joinedAt || ""),
      role: String(u?.role || "user"),
      // Pass the full balances array with walletAddress, externalWalletId, currency, balance details
      balances: Array.isArray(u?.balances) ? u.balances : [],
      totalBalance: Number(u?.totalBalance) || extractBalance(u),
      howYouHeardAboutUs: u?.howYouHeardAboutUs || "—",
    }));

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const totalUsers = Number(
      upstream?.totalUsers ?? upstream?.pagination?.total ?? users.length,
    );
    const totalPages = Number(
      upstream?.totalPages ??
        upstream?.pagination?.totalPages ??
        Math.max(1, Math.ceil(totalUsers / Math.max(1, limitNum))),
    );
    const currentPage = Number(
      upstream?.currentPage ?? upstream?.page ?? upstream?.pagination?.currentPage ?? pageNum,
    );

    return NextResponse.json(
      {
        success: upstream?.success ?? true,
        users,
        totalUsers,
        totalPages,
        currentPage,
      },
      { status: res.status },
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch users" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json();

    if (!id || !action || !["suspend", "activate", "delete"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 },
      );
    }

    // Mock user action - replace with actual API calls
    return NextResponse.json({
      success: true,
      message: `User ${action}d successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process user action" },
      { status: 500 },
    );
  }
}
