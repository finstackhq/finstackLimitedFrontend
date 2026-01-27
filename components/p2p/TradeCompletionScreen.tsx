'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Copy, Download, Star, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { RatingModal } from './RatingModal';

interface TradeCompletionScreenProps {
  tradeId: string;
  reference: string;
  side: 'BUY' | 'SELL';
  cryptoCurrency: string;
  fiatCurrency: string;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  completedAt: string;
  merchantId: string;
  merchantName: string;
  merchantAvatar?: string;
}

export function TradeCompletionScreen({
  tradeId,
  reference,
  side,
  cryptoCurrency,
  fiatCurrency,
  cryptoAmount,
  fiatAmount,
  price,
  completedAt,
  merchantId,
  merchantName,
  merchantAvatar
}: TradeCompletionScreenProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  const handleDownloadReceipt = () => {
    // TODO: Generate and download PDF receipt
    toast({
      title: 'Receipt Downloaded',
      description: 'Transaction receipt has been saved to your downloads'
    });
  };

  const handleRatingSubmit = (rating: 'positive' | 'neutral' | 'negative', comment?: string) => {
    // TODO: Submit rating to backend
    setHasRated(true);
    setShowRatingModal(false);
    toast({
      title: 'Rating Submitted',
      description: 'Thank you for your feedback!'
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <Card>
        <CardContent className="p-8">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
                <CheckCircle className="w-16 h-16 text-green-600 animate-bounce" />
              </div>
              {/* Confetti effect could be added here with a library like react-confetti */}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Trade Completed!</h2>
            <p className="text-gray-600">Your transaction was successful</p>
          </div>

          {/* Transaction Summary */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6 space-y-4">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Transaction Summary
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  You {side === 'BUY' ? 'Paid' : 'Received'}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {fiatAmount.toLocaleString()} {fiatCurrency}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  You {side === 'BUY' ? 'Received' : 'Sent'}
                </span>
                <span className="text-lg font-bold text-green-700">
                  {cryptoAmount} {cryptoCurrency}
                </span>
              </div>

              <Separator className="bg-green-200" />

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Price</span>
                <span className="font-medium">
                  1 {cryptoCurrency} = {price.toFixed(2)} {fiatCurrency}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Transaction ID</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs">{reference}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0"
                    onClick={() => handleCopy(reference, 'Transaction ID')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Completed At</span>
                <span className="font-medium">
                  {new Date(completedAt).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {side === 'BUY' ? 'Seller' : 'Buyer'}
                </span>
                <span className="font-medium">{merchantName}</span>
              </div>
            </div>
          </div>

          {/* Wallet Update Confirmation */}
          {side === 'BUY' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 mb-1">
                    {cryptoAmount} {cryptoCurrency} added to your wallet
                  </p>
                  <p className="text-sm text-blue-700">
                    Your crypto has been credited and is ready to use
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rating Section */}
          {!hasRated && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Rate your experience</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                How was your experience trading with {merchantName}?
              </p>
              <Button
                onClick={() => setShowRatingModal(true)}
                variant="outline"
                className="w-full"
              >
                Leave a Rating
              </Button>
            </div>
          )}

          {hasRated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-center">
              <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 font-medium">
                Thank you for rating this merchant!
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadReceipt}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                onClick={() => router.push('/dashboard/p2p')}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Trade Again
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rating Modal */}
      {showRatingModal && (
        <RatingModal
          open={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
}
