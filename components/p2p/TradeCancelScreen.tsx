'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle, ArrowLeft, History } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TradeCancelScreenProps {
  tradeId: string;
  orderId?: string;
  cryptoCurrency: string;
  fiatCurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  cancelledAt: string;
  cancelledBy?: 'buyer' | 'merchant' | 'system';
  cancelReason?: string;
  wasPaymentMade?: boolean;
}

export function TradeCancelScreen({
  tradeId,
  orderId,
  cryptoCurrency,
  fiatCurrency,
  cryptoAmount,
  fiatAmount,
  cancelledAt,
  cancelledBy = 'buyer',
  cancelReason,
  wasPaymentMade = false
}: TradeCancelScreenProps) {
  const router = useRouter();

  const getCancelMessage = () => {
    if (cancelledBy === 'system') {
      return 'This order was automatically cancelled due to timeout.';
    }
    if (cancelledBy === 'merchant') {
      return 'The merchant has cancelled this order.';
    }
    return 'You have successfully cancelled this order.';
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-8">
          {/* Cancel Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Trade Cancelled</h2>
            <p className="text-gray-600">Order #{tradeId.slice(0, 12)}</p>
          </div>

          {/* Cancellation Details */}
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Cancellation Details</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 mt-2">
                <p className="text-sm">{getCancelMessage()}</p>
                <div className="flex justify-between text-xs">
                  <span>Cancelled At:</span>
                  <span className="font-medium">{new Date(cancelledAt).toLocaleString()}</span>
                </div>
                {cancelReason && (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p className="text-xs font-medium mb-1">Reason:</p>
                    <p className="text-xs">{cancelReason}</p>
                  </div>
                )}
              </div>
            </AlertDescription>
          </Alert>

          {/* Refund Notice */}
          {wasPaymentMade && (
            <Alert className="mb-6">
              <AlertTitle>Refund Information</AlertTitle>
              <AlertDescription>
                If you made a payment, please contact the merchant directly to arrange a refund. 
                Keep a record of your payment proof for reference.
              </AlertDescription>
            </Alert>
          )}

          {/* Transaction Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Crypto Amount</span>
                <span className="font-medium">{cryptoAmount} {cryptoCurrency}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fiat Amount</span>
                <span className="font-medium">{fiatAmount.toLocaleString()} {fiatCurrency}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Status</span>
                <span className="font-medium text-red-600">Cancelled</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => router.push('/dashboard/p2p')}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to P2P Marketplace
            </Button>
            <Button 
              onClick={() => router.push('/dashboard/p2p/orders')}
              variant="outline"
              className="flex-1"
            >
              <History className="w-4 h-4 mr-2" />
              View Order History
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
