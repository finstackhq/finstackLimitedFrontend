import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = process.env.FINSTACK_BACKEND_API_URL;

  try {
    if (!baseUrl) {
      console.error('[admin/dashboard] FINSTACK_BACKEND_API_URL not set');
      return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
    }

    const token = request.cookies.get('access_token')?.value;

    // Fetch dashboard summary from backend
    const summaryEndpoint = `${baseUrl}admin/dashboard-summary`;
    const summaryRes = await fetch(summaryEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    let dashboardData = {
      totalActiveUsers: 0,
      totalSuspendedAccounts: 0,
      pendingKYC: 0,
      totalWalletBalance: 0,
    };

    if (summaryRes.ok) {
      const summaryResponse = await summaryRes.json();
      console.log('[admin/dashboard] Summary data:', summaryResponse);

      if (summaryResponse.success && summaryResponse.data) {
        dashboardData = {
          totalActiveUsers: summaryResponse.data.totalUsers || 0,
          totalSuspendedAccounts: summaryResponse.data.suspendedUsers || 0,
          pendingKYC: summaryResponse.data.pendingKyc || 0,
          totalWalletBalance: summaryResponse.data.totalPlatformBalance || 0,
        };
      }
    } else {
      console.error('[admin/dashboard] Failed to fetch summary:', summaryRes.status);
    }

    // Fetch transaction volume from backend
    const volumeEndpoint = `${baseUrl}admin/volume`;
    let totalTransactionVolume = 0;

    try {
      const volumeRes = await fetch(volumeEndpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });

      if (volumeRes.ok) {
        const volumeData = await volumeRes.json();
        console.log('[admin/dashboard] Volume data:', volumeData);

        if (volumeData.success && volumeData.data?.totalVolume) {
          totalTransactionVolume = volumeData.data.totalVolume;
        }
      }
    } catch (volumeError) {
      console.error('[admin/dashboard] Volume fetch error:', volumeError);
    }

    // Fetch recent transactions using the admin transactions endpoint
    const transactionsEndpoint = `${baseUrl}admin/all-transaction`;
    const transactionsRes = await fetch(transactionsEndpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: 'no-store',
    });

    let recentTransactions: any[] = [];

    if (transactionsRes.ok) {
      const transactionsResponse = await transactionsRes.json();
      console.log('[admin/dashboard] Transactions data:', transactionsResponse);

      // Handle the same data structure as admin/transactions route
      const list = Array.isArray(transactionsResponse?.transactions)
        ? transactionsResponse.transactions
        : Array.isArray(transactionsResponse?.data)
          ? transactionsResponse.data
          : Array.isArray(transactionsResponse)
            ? transactionsResponse
            : [];

      // Map and take first 5 transactions
      recentTransactions = list.slice(0, 5).map((t: any) => {
        const email = t?.userId?.email || t?.metadata?.metadata?.email || '—';
        const userLabel = email && typeof email === 'string'
          ? (email.includes('@') ? email.split('@')[0] : email)
          : 'Unknown User';
        const rawCurrency = t?.currency || t?.metadata?.currency || 'USD';
        const currency = typeof rawCurrency === 'string' && /^[A-Za-z]{3}$/.test(rawCurrency.trim())
          ? rawCurrency.trim().toUpperCase()
          : 'USD';

        return {
          id: t?._id || t?.id || t?.reference || '—',
          user: userLabel,
          userEmail: email,
          type: t?.type || 'Transaction',
          amount: typeof t?.amount === 'number' ? t.amount : Number(t?.amount) || 0,
          currency,
          status: t?.status || 'Pending',
          date: t?.createdAt || t?.updatedAt || new Date().toISOString(),
          reference: t?.reference || t?.txHash || '—',
        };
      });
    } else {
      console.error('[admin/dashboard] Failed to fetch transactions:', transactionsRes.status);
    }

    const stats = {
      totalTransactionVolume,
      ...dashboardData,
      recentTransactions,
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error('[admin/dashboard] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
