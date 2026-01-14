import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/users -> proxy to backend admin/users and normalize shape
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const endpoint = baseUrl ? `${baseUrl}admin/users` : undefined;

  try {
    if (!endpoint) {
      console.error('[admin/users] FINSTACK_BACKEND_API_URL not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const token = request.cookies.get('access_token')?.value;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
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
        out.cookies.delete('access_token');
        out.cookies.set('admin_session', '', {
          path: '/admin',
          maxAge: 0,
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
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
    };

    let users: NormalizedUser[] = list.map((u: any) => ({
      id: String(u?._id || u?.id || ''),
      name: typeof u?.name === 'string' && u.name.trim().length
        ? u.name
        : (typeof u?.email === 'string' ? u.email.split('@')[0] : '—'),
      email: String(u?.email || '—'),
      country: String(u?.country || '—'),
      balance: Number(u?.balance?.total ?? u?.balance ?? 0) || 0,
      currency: String(u?.currency || '—'),
      kycStatus: String(u?.kycStatus || 'not_required'),
      status: String(u?.status || 'active'),
      joinedAt: String(u?.createdAt || u?.joinedAt || ''),
    }));

    // Apply filters client-side
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((user: NormalizedUser) =>
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q)
      );
    }

    if (status) {
      users = users.filter((user: NormalizedUser) => user.status === status);
    }

    return NextResponse.json(users, { status: res.status });
  } catch (error: any) {
    console.error('[admin/users] GET error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action } = await request.json();
    
    if (!id || !action || !['suspend', 'activate', 'delete'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    // Mock user action - replace with actual API calls
    console.log(`${action} user ${id}`);
    
    return NextResponse.json({ 
      success: true, 
      message: `User ${action}d successfully` 
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process user action' },
      { status: 500 }
    );
  }
}