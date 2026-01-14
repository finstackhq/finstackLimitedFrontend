'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trader, P2PAd } from '@/lib/p2p-mock-data';
import { Star, Clock, TrendingUp, ShieldCheck, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TraderProfileModalProps {
  trader: Trader;
  ads: P2PAd[];
  open: boolean;
  onClose: () => void;
  onSelectAd?: (ad: P2PAd) => void;
}

export function TraderProfileModal({ trader, ads, open, onClose, onSelectAd }: TraderProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Trader Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
              {trader.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{trader.name}</h3>
                {trader.verifiedBadge && (
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{trader.rating}%</span>
                </div>
                <span>•</span>
                <span>{trader.totalTrades} trades</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{trader.completionRate}%</p>
              <p className="text-xs text-gray-600">Completion</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{trader.responseTime}</p>
              <p className="text-xs text-gray-600">Response Time</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Store className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-600">{trader.activeAds}</p>
              <p className="text-xs text-gray-600">Active Ads</p>
            </div>
          </div>

          {/* Active Ads */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Active Ads</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {ads.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No active ads</p>
              ) : (
                ads.map(ad => (
                  <div key={ad.id} className="p-3 border rounded-lg hover:bg-gray-50 transition">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          'text-xs',
                          ad.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        )}>
                          {ad.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm font-medium">{ad.cryptoCurrency}/{ad.fiatCurrency}</span>
                      </div>
                      <span className="text-sm font-bold">{ad.price} {ad.fiatCurrency}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Available: {ad.available} {ad.cryptoCurrency}</span>
                      <span>Limit: {ad.minLimit}-{ad.maxLimit}</span>
                    </div>
                    {onSelectAd && (
                      <Button 
                        size="sm" 
                        className="w-full mt-2" 
                        onClick={() => {
                          onSelectAd(ad);
                          onClose();
                        }}
                      >
                        Trade
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
