'use client';

import { MerchantsTable } from '@/components/admin/MerchantsTable';
import { MerchantsFilter } from '@/components/admin/MerchantsFilter';
import { useState, useEffect } from 'react';


// Merchant interface to match the component props
interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  country: string;
  status: 'verified' | 'pending' | 'under_review' | 'suspended';
  tier: 'standard' | 'premium' | 'enterprise';
  avatar: string;
  registrationDate: string;
  lastActive: string;
  totalTrades: number;
  totalVolume: number;
  rating: number;
  reviewCount: number;
  paymentMethods: string[];
  verificationDocuments: Array<{
    type: string;
    status: 'approved' | 'pending' | 'under_review' | 'rejected';
    uploadDate: string;
  }>;
  compliance: {
    kycStatus: 'approved' | 'pending' | 'under_review' | 'rejected';
    amlStatus: 'approved' | 'pending' | 'under_review' | 'flagged';
    riskLevel: 'low' | 'medium' | 'high';
  };
  fees: {
    tradingFee: number;
    withdrawalFee: number;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
  };
  suspensionReason?: string;
}


export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [filteredMerchants, setFilteredMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch merchants from backend API
  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const response = await fetch('/api/admin/merchants');
        if (response.ok) {
          const data = await response.json();
          console.log('Merchants API response:', data);
          
          // Map backend merchant data to frontend structure
          if (data.success && data.users) {
            const mappedMerchants: Merchant[] = data.users.map((user: any, index: number) => ({
              id: user._id || `MER-${index + 1}`,
              businessName: user.businessName || user.email.split('@')[0], // Use email prefix as business name
              ownerName: user.ownerName || user.email.split('@')[0],
              email: user.email,
              phone: user.phone || 'N/A',
              country: user.country || 'Unknown',
              status: (user.status || 'pending') as 'verified' | 'pending' | 'under_review' | 'suspended',
              tier: (user.tier || 'standard') as 'standard' | 'premium' | 'enterprise',
              avatar: user.avatar || `/Memoji-0${(index % 5) + 1}.png`,
              registrationDate: user.createdAt || new Date().toISOString(),
              lastActive: user.lastActive || new Date().toISOString(),
              totalTrades: user.totalTrades || 0,
              totalVolume: user.totalVolume || 0,
              rating: user.rating || 0,
              reviewCount: user.reviewCount || 0,
              paymentMethods: user.paymentMethods || ['Bank Transfer'],
              verificationDocuments: user.verificationDocuments || [],
              compliance: {
                kycStatus: (user.compliance?.kycStatus || 'pending') as 'approved' | 'pending' | 'under_review' | 'rejected',
                amlStatus: (user.compliance?.amlStatus || 'pending') as 'approved' | 'pending' | 'under_review' | 'flagged',
                riskLevel: (user.compliance?.riskLevel || 'medium') as 'low' | 'medium' | 'high',
              },
              fees: {
                tradingFee: user.fees?.tradingFee || 0.8,
                withdrawalFee: user.fees?.withdrawalFee || 15,
              },
              limits: {
                dailyLimit: user.limits?.dailyLimit || 50000,
                monthlyLimit: user.limits?.monthlyLimit || 1000000,
              },
              suspensionReason: user.suspensionReason,
            }));
            
            setMerchants(mappedMerchants);
            setFilteredMerchants(mappedMerchants);
          }
        } else {
          console.error('Failed to fetch merchants:', response.status);
        }
      } catch (error) {
        console.error('Error fetching merchants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMerchants();
  }, []);


  // Custom stats for merchants
  const merchantStats = [
    {
      title: 'Total Merchants',
      value: merchants.length.toString(),
      change: '+12.5%',
      trending: 'up' as const
    },
    {
      title: 'Verified Merchants',
      value: merchants.filter(m => m.status === 'verified').length.toString(),
      change: '+8.2%',
      trending: 'up' as const
    },
    {
      title: 'Pending Verification',
      value: merchants.filter(m => m.status === 'pending' || m.status === 'under_review').length.toString(),
      change: '+15.3%',
      trending: 'up' as const
    },
    {
      title: 'Suspended',
      value: merchants.filter(m => m.status === 'suspended').length.toString(),
      change: '-5.1%',
      trending: 'down' as const
    },
    {
      title: 'Total Trading Volume',
      value: `$${(merchants.reduce((sum, m) => sum + m.totalVolume, 0) / 1000000).toFixed(1)}M`,
      change: '+18.7%',
      trending: 'up' as const
    }
  ];

  const handleFilter = (filters: any) => {
    let filtered = [...merchants];

    if (filters.search) {
      filtered = filtered.filter(merchant => 
        merchant.businessName.toLowerCase().includes(filters.search.toLowerCase()) ||
        merchant.ownerName.toLowerCase().includes(filters.search.toLowerCase()) ||
        merchant.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        merchant.id.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(merchant => merchant.status === filters.status);
    }

    if (filters.tier && filters.tier !== 'all') {
      filtered = filtered.filter(merchant => merchant.tier === filters.tier);
    }

    if (filters.country && filters.country !== 'all') {
      filtered = filtered.filter(merchant => merchant.country === filters.country);
    }

    if (filters.riskLevel && filters.riskLevel !== 'all') {
      filtered = filtered.filter(merchant => merchant.compliance.riskLevel === filters.riskLevel);
    }

    if (filters.dateRange?.from && filters.dateRange?.to) {
      filtered = filtered.filter(merchant => {
        const merchantDate = new Date(merchant.registrationDate);
        return merchantDate >= filters.dateRange.from && merchantDate <= filters.dateRange.to;
      });
    }

    setFilteredMerchants(filtered);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Merchants Management</h1>
            <p className="text-gray-600 mt-1">Manage merchant accounts and verification status</p>
          </div>
        </div>
        <div className="animate-pulse">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Merchants Management</h1>
          <p className="text-gray-600 mt-1">Manage merchant accounts and verification status</p>
        </div>
      </div>

      {/* Custom Stats Cards for Merchants */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
        {merchantStats.map((stat) => (
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

      <MerchantsFilter onFilter={handleFilter} />
      <MerchantsTable merchants={filteredMerchants} />
    </div>
  );
}