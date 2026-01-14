'use client';

import { useState, useEffect } from 'react';
import { MerchantOrderFlow } from '@/components/p2p/MerchantOrderFlow';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Mock orders for demonstration
type OrderStatus = 'pending_payment' | 'awaiting_release' | 'PAYMENT_CONFIRMED_BY_BUYER' | 'completed' | 'disputed';

interface Order {
  id: string;
  reference: string; // Order reference like P2P-1767112468832
  buyerName: string;
  cryptoAmount: number;
  fiatAmount: number;
  netCryptoAmount: number; // After platform fee
  platformFee: number;
  cryptoCurrency: string;
  fiatCurrency: string;
  paymentMethod: string;
  side: string; // BUY or SELL
  marketRate: number;
  status: OrderStatus;
  createdAt: Date;
  expiresAt: Date;
  paymentProof?: string;
}

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/fstack/orders');
        const json = await res.json();
        
        if (json.success && Array.isArray(json.trades)) {
          const mappedOrders: Order[] = json.trades.map((trade: any) => ({
            id: trade._id || trade.id,
            reference: trade.reference || trade._id || trade.id,
            buyerName: trade.userId?.slice(0, 8) + '...' || 'Unknown',
            cryptoAmount: trade.amountCrypto || 0,
            fiatAmount: trade.amountFiat || 0,
            netCryptoAmount: trade.netCryptoAmount || 0,
            platformFee: trade.platformFeeCrypto || 0,
            cryptoCurrency: trade.currencyTarget || 'CNGN',
            fiatCurrency: trade.currencySource || 'XAF',
            paymentMethod: trade.provider || 'BLOCKRADAR',
            side: trade.side || 'BUY',
            marketRate: trade.marketRate || trade.listingRate || 0,
            status: (trade.status || 'pending_payment') as OrderStatus,
            createdAt: new Date(trade.createdAt || Date.now()),
            expiresAt: new Date(trade.expiresAt || Date.now() + 30 * 60 * 1000),
            paymentProof: trade.paymentProof
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);


  const handleComplete = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(o => 
      o.id === selectedOrder.id ? { ...o, status: 'completed' as OrderStatus } : o
    ));
    setSelectedOrder(null);
  };

  const handleDispute = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(o => 
      o.id === selectedOrder.id ? { ...o, status: 'disputed' as OrderStatus } : o
    ));
    setSelectedOrder(null);
  };

  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
        <MerchantOrderFlow
          order={selectedOrder}
          onComplete={handleComplete}
          onDispute={handleDispute}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/merchant">
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">My Orders</h1>
          <p className="text-gray-600">Manage and fulfill your P2P orders</p>
        </div>
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading orders...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/merchant">
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">My Orders</h1>
        <p className="text-gray-600">Manage and fulfill your P2P orders</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No active orders</p>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedOrder(order)}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">{order.reference}</h3>
                  <p className="text-xs text-gray-500">Buyer: {order.buyerName}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'disputed' ? 'bg-red-100 text-red-800' :
                    (order.status === 'awaiting_release' || order.status === 'PAYMENT_CONFIRMED_BY_BUYER') ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {order.status.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">{order.side}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fiat Amount</p>
                  <p className="font-bold text-green-600">{order.fiatAmount.toLocaleString()} {order.fiatCurrency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Crypto Amount</p>
                  <p className="font-bold">{order.cryptoAmount} {order.cryptoCurrency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Net (After Fee)</p>
                  <p className="font-medium text-blue-600">{order.netCryptoAmount} {order.cryptoCurrency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Platform Fee</p>
                  <p className="font-medium text-orange-600">{order.platformFee} {order.cryptoCurrency}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rate</p>
                  <p className="text-sm font-medium">{order.marketRate} {order.fiatCurrency}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Provider</p>
                  <p className="text-sm font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium">{order.createdAt.toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expires</p>
                  <p className="text-sm font-medium">
                    {Math.max(0, Math.floor((order.expiresAt.getTime() - Date.now()) / 1000 / 60))} min
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm">View Details</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
