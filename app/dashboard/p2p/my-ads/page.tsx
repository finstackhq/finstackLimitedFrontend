'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { P2PAd } from '@/lib/p2p-mock-data';
import { 
  getMerchantAds, 
  deleteMerchantAd, 
  toggleAdStatus,
  bulkUpdateAdStatus 
} from '@/lib/p2p-storage';
import { Plus, Edit, Trash2, Eye, CheckSquare, Square, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function MyAdsPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [myAds, setMyAds] = useState<P2PAd[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);

  // Load ads from localStorage
  useEffect(() => {
    loadAds();
    
    // Refresh ads every 2 seconds
    const interval = setInterval(loadAds, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadAds = () => {
    const ads = getMerchantAds();
    // Ensure all ads have isActive property (default to true)
    const adsWithStatus = ads.map(ad => ({
      ...ad,
      isActive: ad.isActive !== undefined ? ad.isActive : true
    }));
    setMyAds(adsWithStatus);
    setLoading(false);
  };

  const filteredAds = myAds.filter(ad => {
    if (statusFilter === 'active') return ad.isActive !== false;
    if (statusFilter === 'inactive') return ad.isActive === false;
    return true;
  });

  const toggleAdActive = (id: string) => {
    toggleAdStatus(id);
    loadAds();
    toast({
      title: 'Ad Status Updated',
      description: 'Ad visibility has been changed successfully.',
    });
  };

  const deleteAd = (id: string) => {
    if (confirm('Are you sure you want to delete this ad? This action cannot be undone.')) {
      deleteMerchantAd(id);
      loadAds();
      toast({
        title: 'Ad Deleted',
        description: 'The ad has been removed successfully.',
        variant: 'destructive',
      });
    }
  };

  const toggleSelectAd = (id: string) => {
    setSelectedAds(prev => 
      prev.includes(id) 
        ? prev.filter(adId => adId !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedAds.length === filteredAds.length) {
      setSelectedAds([]);
    } else {
      setSelectedAds(filteredAds.map(ad => ad.id));
    }
  };

  const bulkActivate = () => {
    if (selectedAds.length === 0) {
      toast({
        title: 'No Ads Selected',
        description: 'Please select at least one ad to activate.',
        variant: 'destructive',
      });
      return;
    }
    
    bulkUpdateAdStatus(selectedAds, true);
    loadAds();
    setSelectedAds([]);
    toast({
      title: 'Ads Activated',
      description: `${selectedAds.length} ad(s) have been activated.`,
    });
  };

  const bulkDeactivate = () => {
    if (selectedAds.length === 0) {
      toast({
        title: 'No Ads Selected',
        description: 'Please select at least one ad to deactivate.',
        variant: 'destructive',
      });
      return;
    }
    
    bulkUpdateAdStatus(selectedAds, false);
    loadAds();
    setSelectedAds([]);
    toast({
      title: 'Ads Deactivated',
      description: `${selectedAds.length} ad(s) have been deactivated.`,
    });
  };

  const activeCount = myAds.filter(ad => ad.isActive !== false).length;
  const inactiveCount = myAds.filter(ad => ad.isActive === false).length;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-2">My Ads</h1>
          <p className="text-sm text-gray-600">
            Manage your P2P trading advertisements. Only merchants can post ads.
          </p>
        </div>
        <Button 
          onClick={() => router.push('/dashboard/merchant')}
          className="bg-[#2F67FA] hover:bg-[#2F67FA]/90"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Ad
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Ads</p>
              <p className="text-2xl font-bold text-gray-900">{myAds.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Power className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-2xl font-bold text-gray-600">{inactiveCount}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <PowerOff className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters and Bulk Actions */}
      {myAds.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ads ({myAds.length})</SelectItem>
                  <SelectItem value="active">Active ({activeCount})</SelectItem>
                  <SelectItem value="inactive">Inactive ({inactiveCount})</SelectItem>
                </SelectContent>
              </Select>

              {filteredAds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-2"
                >
                  {selectedAds.length === filteredAds.length ? (
                    <CheckSquare className="w-4 h-4" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  {selectedAds.length === filteredAds.length ? 'Deselect All' : 'Select All'}
                </Button>
              )}
            </div>

            {selectedAds.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedAds.length} selected</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkActivate}
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Power className="w-4 h-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={bulkDeactivate}
                  className="text-gray-600 border-gray-600 hover:bg-gray-50"
                >
                  <PowerOff className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Ads List */}
      {filteredAds.length === 0 ? (
        <Card className="p-12 text-center">
          <PowerOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2 font-medium">
            {statusFilter === 'all' 
              ? 'No ads available' 
              : `No ${statusFilter} ads`}
          </p>
          <p className="text-xs text-gray-400 mb-4">
            {statusFilter === 'all'
              ? 'Create your first P2P ad to start trading'
              : `Change the filter to see other ads`}
          </p>
          {statusFilter === 'all' && (
            <Button 
              onClick={() => router.push('/dashboard/merchant')}
              variant="outline"
            >
              Create Your First Ad
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAds.map(ad => (
            <Card key={ad.id} className={cn(
              'p-6 transition-all',
              ad.isActive === false && 'opacity-60 bg-gray-50'
            )}>
              <div className="flex flex-col md:flex-row gap-4">
                {/* Checkbox */}
                <div className="flex items-start pt-1">
                  <Checkbox
                    checked={selectedAds.includes(ad.id)}
                    onCheckedChange={() => toggleSelectAd(ad.id)}
                  />
                </div>

                {/* Ad Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <Badge className={cn(
                      'text-xs',
                      ad.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {ad.type.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-lg">
                      {ad.cryptoCurrency}/{ad.fiatCurrency}
                    </span>
                    
                    {/* Status Toggle */}
                    <div className="flex items-center gap-2 ml-auto">
                      <Switch 
                        checked={ad.isActive !== false}
                        onCheckedChange={() => toggleAdActive(ad.id)}
                      />
                      <span className={cn(
                        'text-xs font-medium',
                        ad.isActive !== false ? 'text-green-600' : 'text-gray-500'
                      )}>
                        {ad.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Price</p>
                      <p className="font-medium">{ad.price} {ad.fiatCurrency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Available</p>
                      <p className="font-medium">{ad.available} {ad.cryptoCurrency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Limits</p>
                      <p className="font-medium">{ad.minLimit}-{ad.maxLimit}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time Window</p>
                      <p className="font-medium">{ad.paymentWindow} mins</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-1">Payment Methods:</p>
                    <div className="flex flex-wrap gap-2">
                      {ad.paymentMethods.map(method => (
                        <span key={method} className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                          {method}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex md:flex-col gap-2">
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                    <Edit className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Edit</span>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                    <Eye className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Stats</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 md:flex-none text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => deleteAd(ad.id)}
                  >
                    <Trash2 className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
