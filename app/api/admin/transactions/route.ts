import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/transactions -> proxy to backend admin/all-transaction
export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;
  const endpoint = baseUrl ? `${baseUrl}admin/all-transaction` : undefined;

  const toTitle = (s: any) => {
    if (!s || typeof s !== 'string') return '—';
    const lower = s.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  try {
    if (!endpoint) {
      console.error('[admin/transactions] FINSTACK_BACKEND_API_URL not set');
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

    const list = Array.isArray(upstream?.transactions)
      ? upstream.transactions
      : Array.isArray(upstream?.data)
      ? upstream.data
      : Array.isArray(upstream)
      ? upstream
      : [];

    const mapped = list.map((t: any) => {
      const email = t?.userId?.email || t?.metadata?.metadata?.email || '—';
      const userLabel = email && typeof email === 'string'
        ? (email.includes('@') ? email.split('@')[0] : email)
        : 'Unknown User';
      const id = t?._id || t?.id || t?.reference || '—';
      const date = t?.createdAt || t?.updatedAt || new Date().toISOString();
      const type = t?.type || '—';
      const status = t?.status || '—';
      // Normalize to valid ISO-4217 currency code (uppercase 3-letter)
      const rawCurrency = t?.currency || t?.metadata?.currency || 'USD';
      const currency = typeof rawCurrency === 'string' && /^[A-Za-z]{3}$/.test(rawCurrency.trim())
        ? rawCurrency.trim().toUpperCase()
        : 'USD';
      const amount = typeof t?.amount === 'number' ? t.amount : Number(t?.amount) || 0;
      const reference = t?.reference || t?.txHash || '—';

      return {
        id,
        user: userLabel,
        userEmail: email,
        type: toTitle(type),
        amount,
        currency,
        status: toTitle(status),
        date,
        reference,
      };
    });

    // Sort newest first by date
    mapped.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(mapped, { status: res.status });
  } catch (error: any) {
    console.error('[admin/transactions] GET error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}