'use client';

import { useState, useEffect } from 'react';
import { P2PAd } from '@/lib/p2p-mock-data';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getMerchantAdsByMerchantId, deleteMerchantAd, updateMerchantAd } from '@/lib/p2p-storage';
import { useToast } from '@/hooks/use-toast';
import { Edit, Trash2, Plus } from 'lucide-react';
import { EditAdModal } from './EditAdModal';

interface MerchantAdsListProps {
  merchantId: string;
  onCreateNew?: () => void;
}

export function MerchantAdsList({ merchantId, onCreateNew }: MerchantAdsListProps) {
  const [ads, setAds] = useState<P2PAd[]>([]);
  const [selectedAd, setSelectedAd] = useState<P2PAd | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAds();
  }, [merchantId]);

  const loadAds = () => {
    const merchantAds = getMerchantAdsByMerchantId(merchantId);
    setAds(merchantAds);
  };

  const handleEdit = (ad: P2PAd) => {
    setSelectedAd(ad);
    setShowEditModal(true);
  };

  const handleSaveEdit = (updatedAd: P2PAd) => {
    updateMerchantAd(updatedAd.id, updatedAd);
    setShowEditModal(false);
    loadAds();
    toast({
      title: 'Success',
      description: 'Ad updated successfully'
    });
  };

  const handleDelete = (adId: string) => {
    if (confirm('Are you sure you want to delete this ad?')) {
      deleteMerchantAd(adId);
      loadAds();
      toast({
        title: 'Deleted',
        description: 'Ad has been removed'
      });
    }
  };

  if (ads.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-gray-500 mb-4">You haven't posted any ads yet</p>
        <Button onClick={onCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create First Ad
        </Button>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {ads.map(ad => (
          <Card key={ad.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={ad.type === 'buy' ? 'destructive' : 'default'}>
                    {ad.type.toUpperCase()}
                  </Badge>
                  <span className="font-semibold">
                    {ad.cryptoCurrency}/{ad.fiatCurrency}
                  </span>
                  <span className="text-lg font-bold">
                    {ad.price.toLocaleString()} {ad.fiatCurrency}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Available</p>
                    <p className="font-medium">{ad.available} {ad.cryptoCurrency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Limits</p>
                    <p className="font-medium">{ad.minLimit} - {ad.maxLimit} {ad.fiatCurrency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Methods</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {ad.paymentMethods.slice(0, 2).map(method => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                      {ad.paymentMethods.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{ad.paymentMethods.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Window</p>
                    <p className="font-medium">{ad.paymentWindow} mins</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(ad)}
                  className="text-blue-600 hover:text-blue-700 border-blue-200"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(ad.id)}
                  className="text-red-600 hover:text-red-700 border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {selectedAd && (
        <EditAdModal
          ad={selectedAd}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
}
