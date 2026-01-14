'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { P2POrder, OrderStatus, getMerchant } from '@/lib/p2p-mock-data';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  MessageSquare,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RatingModal } from '@/components/p2p/RatingModal';

interface OrderDetailClientProps {
  orderId: string;
}

export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<P2POrder | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showRating, setShowRating] = useState(false);

  // Load order from localStorage or mock
  useEffect(() => {
    const stored = localStorage.getItem('p2p-orders');
    if (stored) {
      const orders: P2POrder[] = JSON.parse(stored);
      const found = orders.find(o => o.id === orderId);
      if (found) {
        setOrder({
          ...found,
          createdAt: new Date(found.createdAt),
          expiresAt: new Date(found.expiresAt),
          paidAt: found.paidAt ? new Date(found.paidAt) : undefined,
          releasedAt: found.releasedAt ? new Date(found.releasedAt) : undefined,
          completedAt: found.completedAt ? new Date(found.completedAt) : undefined
        });
      }
    }
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (!order || order.status !== 'pending_payment') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const expires = order.expiresAt.getTime();
      const left = Math.max(0, Math.floor((expires - now) / 1000));
      setTimeLeft(left);

      if (left === 0 && order.status === 'pending_payment') {
        handleCancel('Payment timeout');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  const updateOrder = (updates: Partial<P2POrder>) => {
    if (!order) return;
    const updated = { ...order, ...updates };
    setOrder(updated);

    // Save to localStorage
    const stored = localStorage.getItem('p2p-orders');
    const orders: P2POrder[] = stored ? JSON.parse(stored) : [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index] = updated;
    } else {
      orders.push(updated);
    }
    localStorage.setItem('p2p-orders', JSON.stringify(orders));
  };

  const handleMarkPaid = () => {
    updateOrder({
      status: 'PAYMENT_CONFIRMED_BY_BUYER',
      paidAt: new Date()
    });
    toast({
      title: 'Payment Marked',
      description: 'Waiting for seller to release crypto.'
    });
  };

  const handleRelease = () => {
    updateOrder({
      status: 'completed',
      releasedAt: new Date(),
      completedAt: new Date()
    });
    toast({
      title: 'Crypto Released',
      description: 'Transaction completed successfully!'
    });
    setShowRating(true);
  };

  const handleCancel = (reason?: string) => {
    updateOrder({
      status: 'cancelled',
      cancelledAt: new Date()
    });
    toast({
      title: 'Order Cancelled',
      description: reason || 'Order has been cancelled.',
      variant: 'destructive'
    });
  };

  const handleDispute = () => {
    updateOrder({
      status: 'disputed'
    });
    toast({
      title: 'Dispute Opened',
      description: 'Support will review your case shortly.'
    });
  };

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Order not found</p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/p2p')}>
            Back to P2P
          </Button>
        </div>
      </div>
    );
  }

  const merchant = getMerchant(order.merchantId);
  const isCurrentUserBuyer = order.buyerId === 'current-user';

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const statusConfig: Record<OrderStatus, { label: string; color: string; icon: any }> = {
    pending_payment: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    awaiting_release: { label: 'Awaiting Release', color: 'bg-blue-100 text-blue-700', icon: Clock },
    PAYMENT_CONFIRMED_BY_BUYER: { label: 'Payment Confirmed', color: 'bg-blue-100 text-blue-700', icon: Clock },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700', icon: AlertTriangle }
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/p2p')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Order Details</h1>
          <p className="text-sm text-gray-600">#{order.id}</p>
        </div>
      </div>

      {/* Status Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Badge className={cn('text-sm px-3 py-1', status.color)}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {status.label}
          </Badge>
          {order.status === 'pending_payment' && timeLeft > 0 && (
            <div className="flex items-center gap-2 text-red-600">
              <Clock className="w-5 h-5" />
              <span className="text-xl font-bold font-mono">{formatTime(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="relative">
          <div className="flex justify-between mb-2">
            {['Order Created', 'Payment Sent', 'Crypto Released', 'Completed'].map((step, idx) => {
              let active = false;
              if (idx === 0) active = true;
              if (idx === 1) active = order.status !== 'pending_payment';
              if (idx === 2) active = ['completed'].includes(order.status);
              if (idx === 3) active = order.status === 'completed';

              return (
                <div key={step} className="flex-1 text-center relative">
                  <div className={cn(
                    'w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-bold transition',
                    active ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                  )}>
                    {active ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <p className="text-xs text-gray-600">{step}</p>
                </div>
              );
            })}
          </div>
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        </div>
      </Card>

      {/* Order Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Trade Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Amount</span>
              <span className="font-medium">{order.cryptoAmount} {order.cryptoCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price</span>
              <span className="font-medium">{order.price} {order.fiatCurrency}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-lg">{order.fiatAmount} {order.fiatCurrency}</span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">{order.paymentMethod}</span>
            </div>
            {order.userAccountDetails && (
              <div className="pt-2 border-t">
                <span className="text-gray-600 block mb-1">
                  {isCurrentUserBuyer ? 'Your Wallet/Account' : 'Buyer\'s Wallet/Account'}
                </span>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="font-mono text-xs break-all">{order.userAccountDetails}</p>
                </div>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Order Time</span>
              <span className="font-medium">{order.createdAt.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">Merchant</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                {merchant?.name?.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-medium">{merchant?.name}</p>
                <p className="text-xs text-gray-600">
                  {merchant?.totalTrades || 0} trades • {merchant?.rating || 0}% rating
                </p>
              </div>
            </div>
            <Button variant="outline" className="w-full" size="sm">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Merchant
            </Button>
          </div>
        </Card>
      </div>

      {/* Actions */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {order.status === 'pending_payment' && isCurrentUserBuyer && (
            <>
              <Button onClick={handleMarkPaid} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark as Paid
              </Button>
              <Button variant="outline" onClick={() => handleCancel()}>
                Cancel Order
              </Button>
            </>
          )}

          {(order.status === 'awaiting_release' || order.status === 'PAYMENT_CONFIRMED_BY_BUYER') && !isCurrentUserBuyer && (
            <>
              <Button onClick={handleRelease} className="bg-blue-600 hover:bg-blue-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Release Crypto
              </Button>
              <Button variant="outline" onClick={handleDispute}>
                <Shield className="w-4 h-4 mr-2" />
                Open Dispute
              </Button>
            </>
          )}

          {(order.status === 'awaiting_release' || order.status === 'PAYMENT_CONFIRMED_BY_BUYER') && isCurrentUserBuyer && (
            <Button variant="outline" onClick={handleDispute}>
              <Shield className="w-4 h-4 mr-2" />
              Open Dispute
            </Button>
          )}

          {order.status === 'completed' && !order.rating && (
            <Button onClick={() => setShowRating(true)} className="bg-blue-600 hover:bg-blue-700">
              Rate Trade
            </Button>
          )}
        </div>
      </Card>

      {/* Rating Modal */}
      <RatingModal
        open={showRating}
        onClose={() => setShowRating(false)}
        onSubmit={(rating, comment) => {
          updateOrder({ rating, ratingComment: comment });
          toast({
            title: 'Rating Submitted',
            description: 'Thank you for your feedback!'
          });
          setShowRating(false);
        }}
      />
    </div>
  );
}
