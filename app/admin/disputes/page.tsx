'use client';

import { StatsCards } from '../../../components/admin/StatsCards';
import { DisputesTable } from '@/components/admin/DisputesTable';
import { DisputesFilter } from '@/components/admin/DisputesFilter';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [filteredDisputes, setFilteredDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch disputes from API
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/disputes');
      const data = await res.json();

      if (data.success && Array.isArray(data.disputes)) {
        // Map backend data to frontend format
        const mappedDisputes = data.disputes.map((dispute: any) => {
          const openedById = dispute.disputeDetails?.openedBy;
          const buyerId = dispute.userId?._id;
          const sellerId = dispute.merchantId?._id;

          const buyer = {
            id: dispute.userId?._id || '',
            name: `${dispute.userId?.firstName || ''} ${dispute.userId?.lastName || ''}`.trim() || dispute.userId?.email || 'Unknown',
            avatar: '/Memoji-01.png'
          };

          const seller = {
            id: dispute.merchantId?._id || '',
            name: `${dispute.merchantId?.firstName || ''} ${dispute.merchantId?.lastName || ''}`.trim() || dispute.merchantId?.email || 'Unknown',
            avatar: '/Memoji-02.png'
          };

          let initiatedBy = buyer;
          let respondent = seller;

          if (openedById === sellerId) {
            initiatedBy = seller;
            respondent = buyer;
          }

          return {
            id: dispute.reference || dispute._id,
            tradeId: dispute.reference,
            initiatedBy,
            respondent,
            amount: dispute.amountFiat || dispute.amountCrypto || 0,
            currency: dispute.currencySource || dispute.currencyTarget || 'USD',
            status: dispute.status === 'DISPUTE_PENDING' ? 'open' : 
                    dispute.status === 'DISPUTE_RESOLVED' ? 'resolved' : 
                    'under_review',
            priority: 'medium' as const,
            category: 'payment_issue' as const,
            description: dispute.logs?.[dispute.logs.length - 1]?.message || 'Dispute opened',
            createdAt: dispute.createdAt,
            lastUpdate: dispute.updatedAt,
            assignedTo: 'admin1',
            evidence: dispute.disputeDetails?.evidence?.map((ev: any) => ({
              type: ev.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? 'image' : 'document',
              url: ev.url,
              uploadedBy: ev.uploadedBy
            })) || [],
            messages: dispute.logs?.map((log: any, index: number) => ({
              id: `msg${index}`,
              sender: log.actor || 'System',
              message: log.message,
              timestamp: log.time,
              type: log.role === 'system' ? 'system' : (log.role === 'admin' ? 'admin' : 'user')
            })) || [],
            paymentDetails: dispute.paymentDetails,
            tradeDetails: {
              amountFiat: dispute.amountFiat,
              amountCrypto: dispute.amountCrypto,
              price: dispute.listingRate,
              currencySource: dispute.currencySource,
              currencyTarget: dispute.currencyTarget,
              provider: dispute.provider,
            }
          };
        });

        setDisputes(mappedDisputes);
        setFilteredDisputes(mappedDisputes);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats data for disputes
  const statsData = {
    totalTransactionVolume: 0,
    totalActiveUsers: 0,
    totalSuspendedAccounts: 0,
    pendingKYC: 0,
    totalWalletBalance: 0
  };

  // Custom stats for disputes
  const disputeStats = [
    {
      title: 'Total Disputes',
      value: disputes.length.toString(),
      change: '+5.2%',
      trending: 'up' as const
    },
    {
      title: 'Open Disputes',
      value: disputes.filter(d => d.status === 'open').length.toString(),
      change: '+12.1%',
      trending: 'up' as const
    },
    {
      title: 'Under Review',
      value: disputes.filter(d => d.status === 'under_review').length.toString(),
      change: '-3.4%',
      trending: 'down' as const
    },
    {
      title: 'Resolved',
      value: disputes.filter(d => d.status === 'resolved').length.toString(),
      change: '+8.7%',
      trending: 'up' as const
    },
    {
      title: 'High Priority',
      value: disputes.filter(d => d.priority === 'high').length.toString(),
      change: '+15.6%',
      trending: 'up' as const
    }
  ];

  const handleFilter = (filters: any) => {
    let filtered = [...disputes];

    if (filters.search) {
      filtered = filtered.filter(dispute =>
        dispute.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        dispute.tradeId.toLowerCase().includes(filters.search.toLowerCase()) ||
        dispute.initiatedBy.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        dispute.respondent.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        dispute.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(dispute => dispute.status === filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      filtered = filtered.filter(dispute => dispute.priority === filters.priority);
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(dispute => dispute.category === filters.category);
    }

    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(dispute => {
        const disputeDate = new Date(dispute.createdAt);
        return disputeDate >= filters.dateRange.from && disputeDate <= filters.dateRange.to;
      });
    }

    setFilteredDisputes(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Disputes Management</h1>
          <p className="text-gray-600 mt-1">Manage and resolve P2P trading disputes</p>
        </div>
      </div>

      {/* Custom Stats Cards for Disputes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {disputeStats.map((stat) => (
          <div key={stat.title} className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-200 shadow-sm min-w-0">
            <h3 className="text-xs font-medium text-gray-500 mb-2 truncate">{stat.title}</h3>
            <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 truncate">{stat.value}</p>
            <div className="flex items-center">
              {stat.trending === 'up' ? (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-green-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-3 h-3 md:w-4 md:h-4 text-red-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <p className={`text-xs ${
                stat.trending === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <DisputesFilter onFilter={handleFilter} />
      <DisputesTable disputes={filteredDisputes} />
    </div>
  );
}