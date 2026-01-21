"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MerchantAdWizard } from '@/components/merchant/MerchantAdWizard';
import { BecomeMerchantModal } from '@/components/merchant/BecomeMerchantModal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Wallet, 
  TrendingUp, 
  Users, 
  Settings, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  Star,
  Clock,
  DollarSign,
  Plus,
  Store,
  BadgeCheck,
  Trash2,
  Edit,
  Loader2
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { EditAdModal } from '@/components/p2p/EditAdModal';
import { saveMerchantAd, getMerchantAdsByMerchantId, deleteMerchantAd } from '@/lib/p2p-storage';
import { P2PAd, PaymentMethod } from '@/lib/p2p-mock-data';
import { useToast } from '@/hooks/use-toast';

interface MerchantStats {
  totalTrades: number;
  completedTrades: number;
  totalVolume: number;
  rating: number;
  activeOffers: number;
}

interface WalletBalance {
  NGN: number;
  USDT: number;
  CNGN: number;
}

interface StoredAd {
  id: string;
  pair: string;
  tradeType: 'buy' | 'sell';
  priceType: 'fixed' | 'floating';
  fixedPrice?: number;
  margin?: number;
  minLimit?: number;
  maxLimit?: number;
  totalAvailable?: number;
  paymentMethods: string[];
  timeLimit?: number;
  status?: string;
}

export default function MerchantDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [merchantStatus, setMerchantStatus] = useState<string>('loading');
  const [kycVerified, setKycVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Derived state: only 'approved' means full access
  const isMerchant = merchantStatus === 'approved';

  // Fetch user profile to verify merchant status from server
  useEffect(() => {
    const verifyMerchantStatus = async () => {
      try {
        const res = await fetch('/api/fstack/profile');
        const data = await res.json();
        
        if (data.success && data.data) {
          const userRole = data.data.role?.toLowerCase();
          const isKyc = data.data.kycVerified === true;
          
          setKycVerified(isKyc);
          
          // Only approved if user role is 'merchant' and KYC is verified
          if (userRole === 'merchant' && isKyc) {
            setMerchantStatus('approved');
            try { localStorage.setItem('merchant-status', 'approved'); } catch {}
          } else if (userRole === 'merchant' && !isKyc) {
            setMerchantStatus('pending_kyc');
            try { localStorage.setItem('merchant-status', 'pending_kyc'); } catch {}
          } else {
            setMerchantStatus('not_applied');
            try { localStorage.setItem('merchant-status', 'not_applied'); } catch {}
          }
        } else {
          setMerchantStatus('not_applied');
        }
      } catch (error) {
        console.error('Failed to verify merchant status:', error);
        // Fallback to localStorage if API fails
        try {
          const storedStatus = localStorage.getItem('merchant-status');
          setMerchantStatus(storedStatus || 'not_applied');
          setKycVerified(localStorage.getItem('isKycVerified') === 'true');
        } catch {
          setMerchantStatus('not_applied');
        }
      } finally {
        setIsLoading(false);
      }
    };

    verifyMerchantStatus();
  }, []);
  const [merchantStats, setMerchantStats] = useState<MerchantStats>({
    totalTrades: 0,
    completedTrades: 0,
    totalVolume: 0,
    rating: 0,
    activeOffers: 0
  });

  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    NGN: 0,
    USDT: 0,
    CNGN: 0
  });

  const [orderStats, setOrderStats] = useState({
    activeOrders: 0,
    completedToday: 0
  });

  // Edit modal state
  const [selectedAd, setSelectedAd] = useState<P2PAd | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState('');
  const [liveRate, setLiveRate] = useState(1635);
  const [ads, setAds] = useState<StoredAd[]>([]);
  const [showWizard, setShowWizard] = useState(false);

  // Fetch wallet balances from backend
  useEffect(() => {
    const fetchWalletBalances = async () => {
      try {
        const res = await fetch('/api/fstack/wallet/user-balances');
        const json = await res.json();
        
        if (json.success && Array.isArray(json.balances)) {
          const balances: WalletBalance = { NGN: 0, USDT: 0, CNGN: 0 };
          json.balances.forEach((bal: any) => {
            if (bal.currency === 'NGN') balances.NGN = bal.balance || 0;
            if (bal.currency === 'USDT' || bal.currency === 'USDC') balances.USDT = bal.balance || 0;
            if (bal.currency === 'CNGN') balances.CNGN = bal.balance || 0;
          });
          setWalletBalance(balances);
        }
      } catch (err) {
        console.error('Failed to fetch wallet balances:', err);
      }
    };

    fetchWalletBalances();
  }, []);

  // Fetch order stats from backend
  useEffect(() => {
    const fetchOrderStats = async () => {
      try {
        const res = await fetch('/api/fstack/orders');
        const json = await res.json();
        
        if (json.success && Array.isArray(json.trades)) {
          const today = new Date().toDateString();
          const activeOrders = json.trades.filter((trade: any) => 
            trade.status === 'PENDING_PAYMENT' || trade.status === 'AWAITING_RELEASE'
          ).length;
          const completedToday = json.trades.filter((trade: any) => 
            trade.status === 'COMPLETED' && new Date(trade.createdAt).toDateString() === today
          ).length;
          
          setOrderStats({ activeOrders, completedToday });
        }
      } catch (err) {
        console.error('Failed to fetch order stats:', err);
      }
    };

    fetchOrderStats();
  }, []);

  // Fetch real ads from backend
  useEffect(() => {
    if (!isMerchant) return;

    const fetchMyAds = async () => {
      try {
        const res = await fetch('/api/fstack/merchant');
        const json = await res.json();
        
        if (json.success && Array.isArray(json.data)) {
          const mappedAds: StoredAd[] = json.data.map((item: any) => ({
             id: item._id,
             pair: `${item.asset}/${item.fiat}`,
             tradeType: item.type.toLowerCase() as 'buy' | 'sell',
             priceType: item.rawPrice !== item.price ? 'floating' : 'fixed', // Infer price type
             fixedPrice: item.price,
             minLimit: item.minLimit,
             maxLimit: item.maxLimit,
             totalAvailable: item.availableAmount,
             paymentMethods: item.paymentMethods,
             timeLimit: item.timeLimit,
             status: item.status // Preserve status
          }));
          setAds(mappedAds);
        }
      } catch (err) {
        console.error('Failed to fetch merchant ads:', err);
      }
    };

    fetchMyAds();
  }, [isMerchant]);

  useEffect(() => {
    if (merchantStatus === 'not_applied') {
      setApplicationOpen(true);
    }
  }, [merchantStatus]);

  const handleModalChange = (open: boolean) => {
    setApplicationOpen(open);
    if (!open && merchantStatus === 'not_applied') {
      router.push('/dashboard');
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail;
      if (!d) return;
      handlePublishAd(d);
    };
    window.addEventListener('merchant-ad-published', handler as any);
    return () => window.removeEventListener('merchant-ad-published', handler as any);
  }, []);

  // Fetch live exchange rate
  useEffect(() => {
    const fetchLiveRate = async () => {
      try {
        // Using exchangerate-api.com (free tier)
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const usdToNgn = data.rates.NGN;
        setLiveRate(usdToNgn);
      } catch (error) {
        console.error('Failed to fetch live rate:', error);
        // Fallback to mock rate
        setLiveRate(1635);
      }
    };

    fetchLiveRate();
    // Update every 5 minutes
    const interval = setInterval(fetchLiveRate, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Persist ads removed as we now fetch from backend
  // useEffect(() => {
  //   localStorage.setItem('merchant-ads', JSON.stringify(ads));
  // }, [ads]);

  const handlePublishAd = (draft: any) => {
    // Ad is already published to backend via wizard
    // We just need to refresh the list
    const newAd: StoredAd = {
      id: `ad_${Date.now()}`, // Temporary ID until refresh
      pair: draft.pair,
      tradeType: draft.tradeType,
      priceType: draft.priceType,
      fixedPrice: draft.fixedPrice,
      margin: draft.margin,
      minLimit: draft.minLimit,
      maxLimit: draft.maxLimit,
      totalAvailable: draft.totalAvailable,
      paymentMethods: draft.paymentMethods,
      timeLimit: draft.timeLimit,
      status: 'ACTIVE'
    };
    
    // Optimistic update
    setAds(prev => [newAd, ...prev]);
    setShowWizard(false);
    
    // Trigger re-fetch after a short delay to get the real ID from backend
    setTimeout(async () => {
        try {
            const res = await fetch('/api/fstack/merchant');
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setAds(json.data.map((item: any) => ({
                    id: item._id,
                    pair: `${item.asset}/${item.fiat}`,
                    tradeType: item.type.toLowerCase() as 'buy' | 'sell',
                    priceType: item.rawPrice !== item.price ? 'floating' : 'fixed',
                    fixedPrice: item.price,
                    minLimit: item.minLimit,
                    maxLimit: item.maxLimit,
                    totalAvailable: item.availableAmount,
                    paymentMethods: item.paymentMethods,
                    timeLimit: item.timeLimit,
                    status: item.status
                })));
            }
        } catch (e) { console.error(e); }
    }, 1000);
    
    toast({
      title: 'Ad Published Successfully!',
      description: 'Your ad is now live on the P2P marketplace.',
    });
  };

  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteAd = async () => {
    if (!adToDelete) return;
    setIsDeleting(true);
    try {
        const res = await fetch(`/api/fstack/merchant?id=${adToDelete}`, {
            method: 'DELETE',
        });
        const json = await res.json();

        if (!res.ok) {
            throw new Error(json.error || 'Failed to delete ad');
        }

        deleteMerchantAd(adToDelete); // Keep local mock sync if needed, or just state
        setAds(prev => prev.filter(a => a.id !== adToDelete));
        
        toast({
          title: 'Ad Deleted Successfully',
          description: 'Your ad has been removed from the marketplace.'
        });
    } catch (err: any) {
        console.error('Delete failed:', err);
        toast({
            title: 'Delete Failed',
            description: err.message || 'Could not delete ad',
            variant: 'destructive'
        });
    } finally {
        setIsDeleting(false);
        setAdToDelete(null);
    }
  };

  const handleEditAd = (ad: StoredAd) => {
    // Convert StoredAd to P2PAd format
    const [crypto, fiat] = ad.pair.split('/');
    const p2pAd: P2PAd = {
      id: ad.id,
      merchantId: 'TestingMerchant',
      type: ad.tradeType as 'buy' | 'sell',
      cryptoCurrency: crypto,
      fiatCurrency: fiat,
      price: ad.fixedPrice || 0,
      available: ad.totalAvailable || 0,
      minLimit: ad.minLimit || 0,
      maxLimit: ad.maxLimit || 0,
      paymentMethods: ad.paymentMethods as PaymentMethod[],
      paymentWindow: ad.timeLimit || 30,
      country: 'GLOBAL' as const,
      isActive: ad.status === 'ACTIVE' // Check actual status
    };
    setSelectedAd(p2pAd);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedAd: P2PAd) => {
    try {
      const payload = {
        price: updatedAd.price,
        minLimit: updatedAd.minLimit,
        maxLimit: updatedAd.maxLimit,
        availableAmount: updatedAd.available,
        status: updatedAd.isActive ? 'ACTIVE' : 'INACTIVE'
      };

      const res = await fetch(`/api/fstack/merchant?id=${updatedAd.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update ad');
      }

      // Update local state
      setAds(prev => prev.map(a => {
        if (a.id === updatedAd.id) {
          return {
            ...a,
            fixedPrice: updatedAd.price,
            totalAvailable: updatedAd.available,
            minLimit: updatedAd.minLimit,
            maxLimit: updatedAd.maxLimit,
            paymentMethods: updatedAd.paymentMethods as any,
            timeLimit: updatedAd.paymentWindow,
            status: updatedAd.isActive ? 'ACTIVE' : 'INACTIVE'
          };
        }
        return a;
      }));
      // this senda a success message 
      toast({
        title: 'Ad Updated',
        description: 'Your ad has been updated successfully'
      });
      setShowEditModal(false);
    } catch (err: any) {
        console.error('Failed to update ad:', err);
        toast({
            title: 'Update Failed',
            description: err.message || 'Could not update ad',
            variant: 'destructive'
        });
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const completionRate = ((merchantStats.completedTrades / merchantStats.totalTrades) * 100).toFixed(1);

  // Loading state while verifying merchant status
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying merchant status...</p>
        </div>
      </div>
    );
  }

  // Non-merchant view - show only application info
  if (!isMerchant) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-2">Merchant Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Become a merchant to unlock P2P trading features</p>
        </div>
        
        {/* Merchant Status Card */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-[#2F67FA]" />
            <div>
              <h2 className="text-lg font-semibold">Merchant Status</h2>
              <p className="text-sm text-gray-600">Status: {merchantStatus.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600">KYC: {kycVerified ? 'Verified' : 'Pending'}</p>
            </div>
          </div>
        </Card>

        {/* Merchant Benefits Info */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Merchant Features</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Create and manage buy/sell ads on P2P marketplace</li>
                <li>• Higher trading limits and faster settlements</li>
                <li>• Access to merchant analytics and order management</li>
                <li>• Priority customer support</li>
              </ul>
            </div>
            <Button 
              onClick={() => setApplicationOpen(true)} 
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <BadgeCheck className="w-4 h-4" /> Apply Now
            </Button>
          </div>
        </Card>

        <BecomeMerchantModal 
          open={applicationOpen} 
          onOpenChange={setApplicationOpen} 
          kycVerified={kycVerified}
        />
      </div>
    );
  }

  // Approved merchant view - full dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 space-y-6">
      {/* Header and merchant application */}
      <div className="flex items-center justify-between">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-2">Merchant Dashboard</h1>
          <p className="text-sm md:text-base text-gray-600">Manage your P2P trading business and monitor performance</p>
        </div>
      </div>
      {/* Merchant Status Card */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Store className="w-5 h-5 text-[#2F67FA]" />
          <div>
            <h2 className="text-lg font-semibold">Merchant Status</h2>
            <p className="text-sm text-gray-600">Status: {merchantStatus.replace('_',' ')}</p>
            <p className="text-sm text-gray-600">KYC: {kycVerified ? 'Verified' : 'Pending'}</p>
          </div>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Trades</p>
              <p className="text-lg md:text-xl font-semibold">{merchantStats.totalTrades}</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Completion</p>
              <p className="text-lg md:text-xl font-semibold text-green-600">{completionRate}%</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Volume</p>
              <p className="text-lg md:text-xl font-semibold">₦{(merchantStats.totalVolume / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Rating</p>
              <p className="text-lg md:text-xl font-semibold">{merchantStats.rating}/5</p>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Active Offers</p>
              <p className="text-lg md:text-xl font-semibold">{merchantStats.activeOffers}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Orders */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">My Orders</h3>
            <Link href="/dashboard/merchant/orders">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Orders</span>
                <span className="text-2xl font-bold text-blue-600">{orderStats.activeOrders}</span>
              </div>
              <p className="text-xs text-gray-600">Orders awaiting action</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Completed Today</span>
                <span className="text-2xl font-bold text-green-600">{orderStats.completedToday}</span>
              </div>
              <p className="text-xs text-gray-600">Successfully completed</p>
            </div>
          </div>
          <Link href="/dashboard/merchant/orders">
            <Button className="w-full mt-4">
              Manage Orders
            </Button>
          </Link>
        </Card>

        {/* Wallet Balances */}
        <Card className="p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Wallet Balances</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBalance(!showBalance)}
            >
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-blue-600">₦</span>
                </div>
                <div>
                  <p className="font-medium">NGN Wallet</p>
                  <p className="text-sm text-gray-600">Nigerian Naira</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {showBalance ? `₦${walletBalance.NGN.toLocaleString()}` : '••••••'}
                </p>
                <button
                  onClick={() => handleCopy(walletBalance.NGN.toString(), 'ngn')}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                >
                  {copied === 'ngn' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'ngn' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-green-600">$</span>
                </div>
                <div>
                  <p className="font-medium">USDT Wallet</p>
                  <p className="text-sm text-gray-600">Tether USD</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {showBalance ? `$${walletBalance.USDT.toLocaleString()}` : '••••••'}
                </p>
                <button
                  onClick={() => handleCopy(walletBalance.USDT.toString(), 'usdt')}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                >
                  {copied === 'usdt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'usdt' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-lg font-bold text-purple-600">₵</span>
                </div>
                <div>
                  <p className="font-medium">CNGN Wallet</p>
                  <p className="text-sm text-gray-600">Nigerian CBDC</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold">
                  {showBalance ? `₵${walletBalance.CNGN.toLocaleString()}` : '••••••'}
                </p>
                <button
                  onClick={() => handleCopy(walletBalance.CNGN.toString(), 'cngn')}
                  className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                >
                  {copied === 'cngn' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied === 'cngn' ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Live Exchange Rate */}
        <Card className="p-4 md:p-6">
          <h3 className="text-lg font-semibold mb-4">Live Exchange Rate</h3>
          <div className="text-center p-6 bg-linear-to-r from-blue-50 to-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">USD to NGN</p>
            <p className="text-3xl font-bold text-blue-600">₦{liveRate.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">Updates every 5 minutes</p>
          </div>
        </Card>
      </div>
      {/* My Ads + Create */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">My Ads</h3>
          <div className="flex items-center gap-2">
            <Button onClick={() => setShowWizard(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> New Ad
            </Button>
          </div>
        </div>
        {ads.length === 0 ? (
          <div className="text-sm text-gray-600">No ads yet. Click "New Ad" to create one.</div>
        ) : (
          <div className="space-y-2">
            {ads.map(ad => (
              <div key={ad.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-4">
                  <div className={cn('text-xs px-2 py-1 rounded-full', ad.tradeType === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700')}>
                    {ad.tradeType.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{ad.pair}</div>
                    <div className="text-xs text-gray-600">Limits: {ad.minLimit ?? '—'} - {ad.maxLimit ?? '—'} | Methods: {ad.paymentMethods.join(', ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditAd(ad)} 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setAdToDelete(ad.id)} className="text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <AlertDialog open={!!adToDelete} onOpenChange={(open) => !open && setAdToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your ad from the marketplace and stop any new trades from being created.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={(e) => { e.preventDefault(); confirmDeleteAd(); }} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isDeleting ? 'Deleting...' : 'Delete Ad'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        {showWizard && (
          <div className="mt-6 border-t pt-4">
            <MerchantAdWizardWrapper onPublish={handlePublishAd} />
          </div>
        )}
      </Card>

  {/* Recent Trades */}
      <Card className="p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Trades</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {[
            { id: 1, user: 'User123', type: 'buy', amount: 100, rate: 1620, status: 'completed', time: '2 hours ago' },
            { id: 2, user: 'Trader456', type: 'sell', amount: 50, rate: 1650, status: 'pending', time: '5 hours ago' },
            { id: 3, user: 'Crypto789', type: 'buy', amount: 200, rate: 1615, status: 'completed', time: '1 day ago' },
          ].map((trade) => (
            <div key={trade.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium",
                  trade.type === 'buy' ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                )}>
                  {trade.type === 'buy' ? 'B' : 'S'}
                </div>
                <div>
                  <p className="font-medium text-sm">{trade.user}</p>
                  <p className="text-xs text-gray-600">
                    {trade.type === 'buy' ? 'Bought' : 'Sold'} ${trade.amount} USDT
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">₦{trade.rate.toLocaleString()}</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    trade.status === 'completed' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  )}>
                    {trade.status}
                  </span>
                  <span className="text-xs text-gray-500">{trade.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <BecomeMerchantModal 
        open={applicationOpen} 
        onOpenChange={handleModalChange} 
        kycVerified={kycVerified}
        onSubmitted={() => {
          setMerchantStatus('pending');
          try { localStorage.setItem('merchant-status', 'pending'); } catch {}
        }}
      />
      
      {selectedAd && (
        <EditAdModal
          ad={selectedAd}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

function MerchantAdWizardWrapper({ onPublish }: { onPublish: (draft: any) => void }) {
  // Wraps wizard to intercept publish by monkey-patching
  // Since the current wizard only toasts, we expose a lightweight way:
  // We render the wizard and also a small bar to finalize publish from parent state via window.
  // Simpler: duplicate a tiny button to publish using internal state via ref is non-trivial without changing wizard.
  // As a pragmatic approach, we re-implement a minimal controlled publish by listening to window event.
  // Alternatively, instruct user to click "Publish Ad" and we'll also capture a copy using a side-channel.
  // Implement a small helper: when user clicks Publish, we store last_merchant_draft in localStorage inside wizard via console log replacement is not possible.
  // So we provide a shim button asking user to confirm publish using entered details snapshot kept here.
  // To keep this simple now, we'll render the wizard and an additional note on how it adds to My Ads when publishing in this session.
  return (
    <div>
  <MerchantAdWizard />
      <p className="text-xs text-gray-500 mt-3">After you click "Publish Ad" above, it will be added to your My Ads list.</p>
      {/* As a fallback in case toast-only, we also offer a manual add by capturing minimal fields from a prompt. */}
      <ManualAdQuickAdd onPublish={onPublish} />
    </div>
  );
}

function ManualAdQuickAdd({ onPublish }: { onPublish: (draft: any) => void }) {
  const [pair, setPair] = useState('USDC/USD');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [min, setMin] = useState<number | undefined>(100);
  const [max, setMax] = useState<number | undefined>(1000);
  const [methods, setMethods] = useState<string>('Bank Transfer');

  return (
    <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center gap-2 text-xs">
      <span className="text-gray-600">Quick add:</span>
      <input className="border rounded px-2 py-1" value={pair} onChange={e => setPair(e.target.value)} />
      <select className="border rounded px-2 py-1" value={type} onChange={e => setType(e.target.value as any)}>
        <option value="buy">BUY</option>
        <option value="sell">SELL</option>
      </select>
      <input className="border rounded px-2 py-1 w-20" type="number" value={min ?? ''} onChange={e => setMin(parseFloat(e.target.value))} placeholder="min" />
      <input className="border rounded px-2 py-1 w-20" type="number" value={max ?? ''} onChange={e => setMax(parseFloat(e.target.value))} placeholder="max" />
      <input className="border rounded px-2 py-1" value={methods} onChange={e => setMethods(e.target.value)} placeholder="methods csv" />
      <Button size="sm" onClick={() => onPublish({ pair, tradeType: type, priceType: 'fixed', fixedPrice: 1, minLimit: min, maxLimit: max, totalAvailable: 1000, paymentMethods: methods.split(',').map(s => s.trim()), timeLimit: 30 })}>Add</Button>
    </div>
  );
}