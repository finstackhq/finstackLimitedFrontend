'use client';

import { useState, useEffect } from 'react';
import { P2POrdersTable } from '@/components/admin/P2POrdersTable';
import { P2POrdersFilter } from '@/components/admin/P2POrdersFilter';
import { Loader2 } from 'lucide-react';

export default function P2POrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalVolume: 0,
    activeOrders: 0,
    completedToday: 0,
    disputeRate: 0
  });

  // Fetch P2P orders from API
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (status?: string) => {
    setLoading(true);
    try {
      const url = status 
        ? `/api/admin/p2p?status=${status}`
        : '/api/admin/p2p';
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        // Map backend data to frontend format
        const mappedOrders = data.data.map((trade: any) => ({
          id: trade.reference || trade._id,
          buyer: trade.userId?.email || 'Unknown',
          buyerEmail: trade.userId?.email || '',
          seller: trade.merchantId?.email || 'N/A',
          sellerEmail: trade.merchantId?.email || '',
          amount: trade.amountSource || 0,
          currency: trade.currencySource || 'NGN',
          cryptoAmount: trade.amountTarget || 0,
          cryptoCurrency: trade.currencyTarget || 'USDT',
          rate: trade.rate || 0,
          status: trade.status?.toLowerCase() || 'pending',
          paymentMethod: trade.provider || 'N/A',
          date: trade.createdAt,
          reference: trade.reference || trade._id,
          escrowReleased: trade.status === 'COMPLETED',
          disputeCount: trade.status === 'DISPUTED' ? 1 : 0,
        }));

        setOrders(mappedOrders);
        setFilteredOrders(mappedOrders);

        // Calculate stats
        const today = new Date().toDateString();
        const totalVol = mappedOrders.reduce((sum: number, o: any) => sum + o.amount, 0);
        const active = mappedOrders.filter((o: any) => 
          o.status === 'pending_payment' || o.status === 'awaiting_release'
        ).length;
        const completedToday = mappedOrders.filter((o: any) => 
          o.status === 'completed' && new Date(o.date).toDateString() === today
        ).length;
        const disputed = mappedOrders.filter((o: any) => o.status === 'disputed').length;
        const disputeRate = mappedOrders.length > 0 
          ? ((disputed / mappedOrders.length) * 100).toFixed(1)
          : '0';

        setStats({
          totalVolume: totalVol,
          activeOrders: active,
          completedToday,
          disputeRate: parseFloat(disputeRate)
        });
      }
    } catch (error) {
      console.error('Failed to fetch P2P orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filters: any) => {
    console.log('Filters applied:', filters);
    
    // Fetch with status filter if provided
    if (filters.status && filters.status !== 'all') {
      fetchOrders(filters.status.toUpperCase());
    } else {
      fetchOrders();
    }
  };

  const p2pStats = [
    {
      title: 'Total P2P Volume',
      value: `₦${stats.totalVolume.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up' as const,
    },
    {
      title: 'Active Orders',
      value: stats.activeOrders.toString(),
      change: '+3',
      trend: 'up' as const,
    },
    {
      title: 'Completed Today',
      value: stats.completedToday.toString(),
      change: '+8.2%',
      trend: 'up' as const,
    },
    {
      title: 'Dispute Rate',
      value: `${stats.disputeRate}%`,
      change: '-0.5%',
      trend: 'down' as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">P2P Orders</h1>
        <p className="text-gray-600 mt-1">Monitor and manage peer-to-peer trading orders</p>
      </div>

      <div className="animate-in fade-in slide-in-from-top-4 duration-700">
      {/* Custom Stats Cards for P2P Orders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {p2pStats.map((stat) => (
          <div key={stat.title} className="bg-white p-4 md:p-6 rounded-lg border border-gray-200 shadow-sm min-w-0">
            <h3 className="text-xs font-medium text-gray-500 mb-2 truncate">{stat.title}</h3>
            <p className="text-lg md:text-xl font-semibold text-gray-900 mb-1 truncate">{stat.value}</p>
            <div className="flex items-center">
              {stat.trend === 'up' ? (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-600 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-red-600 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <p className={`text-xs truncate ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <P2POrdersFilter onFilterChange={handleFilterChange} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <P2POrdersTable orders={filteredOrders} />
      </div>
    </div>
  );
}