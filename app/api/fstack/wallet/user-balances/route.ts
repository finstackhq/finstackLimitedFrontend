import { NextRequest, NextResponse } from 'next/server';

// Proxy user wallet balances to backend: GET /api/wallet/user-balances
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const endpoint = baseUrl ? `${baseUrl}wallet/user-balances` : undefined;

  try {
    if (!endpoint) {
      console.error('[wallet/user-balances] FINSTACK_BACKEND_API_URL not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

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

    // Auto-logout on unauthorized: clear user access token
    if (res.status === 401) {
      const out = NextResponse.json(upstream, { status: 401 });
      try {
        out.cookies.delete('access_token');
      } catch {}
      return out;
    }

    return NextResponse.json(upstream, { status: res.status });
  } catch (error: any) {
    console.error('[wallet/user-balances] GET error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch wallet balances' },
      { status: 500 }
    );
  }
}