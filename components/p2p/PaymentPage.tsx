"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, Clock, CheckCircle, AlertTriangle, Copy, ArrowRight, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { TradeCancelScreen } from './TradeCancelScreen';
import { TradeDisputeScreen } from './TradeDisputeScreen';
import { TradeCompletionScreen } from './TradeCompletionScreen';
import { CancelConfirmationDialog } from './CancelConfirmationDialog';

type StoredTradeContext = {
  tradeId: string;
  createdAt: string;
  paymentWindow?: number;
  sellerFirstName?: string;
  sellerLastName?: string;
  sellerName?: string;
  instructions?: string;
  paymentMethods?: string[];
  ad?: {
    id: string;
    type: 'buy' | 'sell';
    cryptoCurrency: string;
    fiatCurrency: string;
    price: number;
    minLimit: number;
    maxLimit: number;
    available: number;
    country: string;
  };
  initiate?: {
    reference?: string;
    side?: 'BUY' | 'SELL' | string;
    amountFiat?: number;
    amountCrypto?: number;
    platformFeeCrypto?: number;
    netCryptoAmount?: number;
    marketRate?: number;
    listingRate?: number;
  };
  status?: 'pending_payment' | 'paid' | 'awaiting_merchant_confirmation' | 'completed' | 'cancelled' | 'disputed' | string;
  cancelledAt?: string;
  cancelledBy?: 'buyer' | 'merchant' | 'system';
  cancelReason?: string;
  completedAt?: string;
  disputedAt?: string;
};

interface PaymentPageProps {
  tradeId: string;
}

export function PaymentPage({ tradeId }: PaymentPageProps) {
  const [ctx, setCtx] = useState<StoredTradeContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [localPaid, setLocalPaid] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`p2p_trade_${tradeId}`);
      if (!raw) {
        setCtx(null);
        setLoading(false);
        router.replace('/dashboard/p2p');
        return;
      }

      const parsed = JSON.parse(raw) as StoredTradeContext;
      setCtx(parsed);
      console.log('P2P trade context loaded:', parsed);
    } catch (e) {
      console.error('Failed to load stored trade context', e);
      setCtx(null);
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    if (!ctx) return;
    const paymentWindowMinutes = Number(ctx.paymentWindow) || 0;
    if (!ctx.createdAt || !paymentWindowMinutes) return;

    const computeTime = () => {
        const created = new Date(ctx.createdAt).getTime();
        const windowMs = paymentWindowMinutes * 60 * 1000;
        const expireTime = created + windowMs;
        const now = new Date().getTime();
        const diff = Math.max(0, expireTime - now);
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Set initial or paused time
    setTimeLeft(computeTime());

    // Pause timer if status is 'paid' or 'completed' or locally marked as paid
    const status = (ctx.status || 'pending_payment').toLowerCase();
    if (status === 'paid' || status === 'completed' || localPaid) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(computeTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [ctx, ctx?.status, localPaid]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard'
    });
  };

  // User Buying: User clicks "I have paid" -> Calls confirm-payment
  const handleMarkPaid = async () => {
    try {
      setLocalPaid(true); // Optimistically pause timer and change button
      setUpdating(true);
      const reference = ctx?.initiate?.reference;
      if (!reference) throw new Error('Trade reference not found');

      const res = await fetch('/api/fstack/p2p/confirm-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
          setLocalPaid(false); // Revert on failure
          throw new Error(data.error || data.message || 'Failed to confirm payment');
      }

      updateLocalStatus('paid');
      toast({ 
        title: 'Payment Successful', 
        description: 'Great! The seller has been notified of your payment. Please wait for them to confirm and release the crypto.',
        duration: 5000,
      });
    } catch (error: any) {
      setLocalPaid(false); // Revert on failure
      console.error('Failed to confirm payment:', error);
      toast({ title: 'Error', description: error.message || 'Failed to confirm payment', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  // User Selling: User clicks "Payment Received" -> Calls initiate-release (Sends OTP)
  const handleInitiateRelease = async () => {
    try {
      setUpdating(true);
      const reference = ctx?.initiate?.reference;
      if (!reference) throw new Error('Trade reference not found');

      const res = await fetch(`/api/fstack/trade/${reference}/initiate-release`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({})
      });
      
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || data.message || 'Failed to initiate release');

      setShowOtpModal(true);
      toast({ title: 'OTP Sent', description: 'A 6-digit code has been sent to your email.' });
    } catch (error: any) {
      console.error('Failed to initiate release:', error);
      toast({ title: 'Error', description: error.message || 'Failed to initiate release', variant: 'destructive' });
    } finally {
      setUpdating(false);
    }
  };

  // User Selling: Verify OTP -> Calls confirm-release
   const handleVerifyRelease = async () => {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
         setOtpError('Please enter all 6 digits');
         return;
      }

      setVerifyingOtp(true);
      setOtpError('');
      
      try {
        const reference = ctx?.initiate?.reference;
        // Changed from tradeId to reference for backend compatibility
        const res = await fetch(`/api/fstack/trade/${reference}/confirm-release`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ otpCode: otpCode }) // Backend expects { otpCode: "..." }
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error || data.message || 'Invalid OTP');
        }

        setShowOtpModal(false);
        const now = new Date().toISOString();
        updateLocalStatus('completed', { completedAt: now });
        toast({ title: 'Transaction Successful', description: 'Crypto released successfully.' });
      } catch (error: any) {
          setOtpError(error.message || 'Verification failed');
      } finally {
          setVerifyingOtp(false);
      }
   };

   // Cancel trade handler
   const handleCancelTrade = async (reason?: string) => {
     setCancelling(true);
     try {
       const reference = ctx?.initiate?.reference;
       if (!reference) throw new Error('Trade reference not found');

       const res = await fetch('/api/fstack/p2p/cancel', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ tradeId: reference })
       });

       const data = await res.json();
       
       if (!res.ok || !data.success) {
         throw new Error(data.error || data.message || 'Failed to cancel trade');
       }

       const now = new Date().toISOString();
       updateLocalStatus('cancelled', {
         cancelledAt: now,
         cancelledBy: 'buyer',
         cancelReason: reason
       });

       setShowCancelDialog(false);
       toast({ 
         title: 'Trade Cancelled', 
         description: 'Your order has been cancelled successfully.'
       });
     } catch (error: any) {
       console.error('Failed to cancel trade:', error);
       toast({ 
         title: 'Error', 
         description: error.message || 'Failed to cancel trade', 
         variant: 'destructive' 
       });
     } finally {
       setCancelling(false);
     }
   };
  
  const updateLocalStatus = (newStatus: string, additionalData?: Partial<StoredTradeContext>) => {
      const raw = localStorage.getItem(`p2p_trade_${tradeId}`);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredTradeContext;
        const next = { ...parsed, status: newStatus, ...additionalData };
        localStorage.setItem(`p2p_trade_${tradeId}`, JSON.stringify(next));
        setCtx(next);
      }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^[0-9]*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');
    
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ctx) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Trade not found</h2>
        <Button className="mt-4" onClick={() => router.push('/dashboard/p2p')}>Back to P2P</Button>
      </div>
    );
  }

  const cryptoCode = ctx.ad?.cryptoCurrency || 'CRYPTO';
  const fiatCode = ctx.ad?.fiatCurrency || 'FIAT';
  const amountFiat = typeof ctx.initiate?.amountFiat === 'number' ? ctx.initiate.amountFiat : undefined;
  const amountCrypto = typeof ctx.initiate?.amountCrypto === 'number' ? ctx.initiate.amountCrypto : undefined;
  const price = typeof ctx.initiate?.listingRate === 'number' ? ctx.initiate.listingRate : (typeof ctx.initiate?.marketRate === 'number' ? ctx.initiate.marketRate : ctx.ad?.price);
  const status = ctx.status || 'pending_payment';

  // Show Cancel Screen
  if (status === 'cancelled') {
    return (
      <TradeCancelScreen
        tradeId={ctx.tradeId}
        orderId={ctx.initiate?.reference}
        cryptoCurrency={cryptoCode}
        fiatCurrency={fiatCode}
        cryptoAmount={amountCrypto || 0}
        fiatAmount={amountFiat || 0}
        cancelledAt={ctx.cancelledAt || new Date().toISOString()}
        cancelledBy={ctx.cancelledBy}
        cancelReason={ctx.cancelReason}
        wasPaymentMade={localPaid}
      />
    );
  }

  // Show Dispute Screen (waiting for merchant confirmation with dispute option)
  if (status === 'disputed' || (status === 'paid' && ctx.initiate?.side !== 'SELL')) {
    return (
      <TradeDisputeScreen
        tradeId={ctx.tradeId}
        reference={ctx.initiate?.reference || ctx.tradeId}
        paidAt={new Date(ctx.createdAt)} // Use trade creation as paid time
        cryptoCurrency={cryptoCode}
        fiatCurrency={fiatCode}
        cryptoAmount={amountCrypto || 0}
        fiatAmount={amountFiat || 0}
        disputeThresholdMinutes={15}
        onDisputeSubmitted={() => {
          updateLocalStatus('disputed', { disputedAt: new Date().toISOString() });
        }}
      />
    );
  }

  // Show Completion Screen
  if (status === 'completed') {
    return (
      <TradeCompletionScreen
        tradeId={ctx.tradeId}
        reference={ctx.initiate?.reference || ctx.tradeId}
        side={ctx.initiate?.side === 'SELL' ? 'SELL' : 'BUY'}
        cryptoCurrency={cryptoCode}
        fiatCurrency={fiatCode}
        cryptoAmount={amountCrypto || 0}
        fiatAmount={amountFiat || 0}
        price={price || 0}
        completedAt={ctx.completedAt || new Date().toISOString()}
        merchantId={ctx.ad?.id || 'merchant'}
        merchantName={ctx.sellerName || 'Merchant'}
      />
    );
  }


  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                {ctx.initiate?.side === 'SELL' ? 'Sell' : 'Buy'} {cryptoCode}
                {/* Status Badge moved to top left per request for User Sell side, applying globally for consistency or conditional? req said "only on the user sell side" */}
                {ctx.initiate?.side === 'SELL' && (
                     <Badge variant={status === 'pending_payment' ? 'outline' : 'default'}>
                        {status.replace('_', ' ')}
                     </Badge>
                )}
            </h1>
             {/* If NOT Sell side, keep badge here or if we want it for both */}
             {ctx.initiate?.side !== 'SELL' && (
                <Badge variant={status === 'pending_payment' ? 'outline' : 'default'} className="mt-1">
                    {status.replace('_', ' ')}
                </Badge>
             )}
            <p className="text-muted-foreground text-sm">Trade ID: {ctx.tradeId}</p>
        </div>
        
        {status === 'pending_payment' && !isExpired && (
            <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Time remaining to pay</p>
                        <p className="text-xl font-bold font-mono text-primary">{timeLeft}</p>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Payment Details */}
        <div className="md:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        {/* Dynamic Label: If User Sell, "Amount to Receive" (Fiat), If User Buy, "Amount to Pay" (Fiat) */}
                        <span className="text-sm font-medium text-muted-foreground">
                            {ctx.initiate?.side === 'SELL' ? 'Amount to Receive' : 'Amount to Pay'}
                        </span>
                        <div className="text-right">
                            <span className="text-xl font-bold">{amountFiat ?? '-'} {fiatCode}</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                         {/* Dynamic Label: If User Sell, "Amount to Send" (Crypto), If User Buy, "Amount to Receive" (Crypto) */}
                         <span className="text-sm font-medium text-muted-foreground">
                            {ctx.initiate?.side === 'SELL' ? 'Amount to Send' : 'Amount to Receive'}
                         </span>
                         <div className="text-right">
                             <span className="text-xl font-bold">{amountCrypto ?? '-'} {cryptoCode}</span>
                         </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Price</span>
                        <span className="font-medium">
                           1 {cryptoCode} ≈ {typeof price === 'number' ? price.toFixed(2) : '-'} {fiatCode}
                        </span>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>Make payment to the seller's account below</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {ctx.paymentMethods && ctx.paymentMethods.length > 0 ? (
                      <div className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          {ctx.paymentMethods.map((m) => (
                            <Badge key={m} variant="secondary">{m}</Badge>
                          ))}
                        </div>
                        {ctx.sellerName ? (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Seller</span>
                            <span className="font-medium">{ctx.sellerName}</span>
                          </div>
                        ) : null}
                        {ctx.instructions ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Instructions</span>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(ctx.instructions!)}>
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-sm whitespace-pre-wrap">{ctx.instructions}</div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>No Payment Methods</AlertTitle>
                            <AlertDescription>
                                No payment methods found for this trade. Please contact support.
                            </AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
                <Alert>
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                        {ctx.initiate?.side === 'SELL' 
                          ? 'Only release crypto after you have confirmed receipt of payment in your bank account.' 
                          : 'Only click "I have paid" after you have successfully transferred the money. Maliciously clicking this button may lead to account suspension.'}
                    </AlertDescription>
                </Alert>
                
                {(status === 'paid' || localPaid) && ctx.initiate?.side !== 'SELL' ? (
                   <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 text-center space-y-3 animate-in fade-in zoom-in duration-300">
                       <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                          <CheckCircle className="w-8 h-8 text-primary" />
                       </div>
                       <h3 className="text-xl font-bold text-primary">Awaiting Merchant Release</h3>
                       <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                           You've successfully marked this as paid. The seller is verifying your payment. Once confirmed, they will release the crypto to your wallet.
                       </p>
                   </div>
                ) : isExpired ? (
                    <Button variant="destructive" className="w-full" disabled>
                        Order Expired
                    </Button>
                ) : (
                    <div className="space-y-3">
                        {/* Primary Action Button */}
                        <Button 
                            size="lg" 
                            className="w-full text-lg font-bold h-14 bg-green-600 hover:bg-green-700" 
                            onClick={ctx.initiate?.side === 'SELL' ? handleInitiateRelease : handleMarkPaid}
                            disabled={status !== 'pending_payment' && ctx.initiate?.side !== 'SELL' || updating}
                        >
                            {updating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                            {updating 
                              ? 'Processing...' 
                              : (ctx.initiate?.side === 'SELL' ? 'Payment Received' : 'Payment Completed')}
                        </Button>
                        
                        {/* Cancel Button - Only show for User Buy flow, not User Sell */}
                        {ctx.initiate?.side !== 'SELL' && (
                          <Button 
                              size="lg"
                              variant="destructive"
                              className="w-full text-lg font-bold h-14" 
                              onClick={() => setShowCancelDialog(true)}
                              disabled={updating}
                          >
                              <XCircle className="h-5 w-5 mr-2" />
                              Cancel Order
                          </Button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Chat/Support (Placeholder) */}
        <div className="space-y-6">
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle>Trade Chat</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-center items-center text-center p-6 text-muted-foreground">
                    <div className="bg-muted p-4 rounded-full mb-4">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <p>Chat feature coming soon.</p>
                    <p className="text-sm mt-2">Please use the contact details provided in payment instructions if needed.</p>
                </CardContent>
            </Card>
        </div>
      </div>
      
      {/* OTP Modal for User Sell Release */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
           <Card className="w-full max-w-md p-6 space-y-4">
             <div className="text-center">
               <h3 className="text-xl font-semibold mb-2">Enter OTP Code</h3>
               <p className="text-sm text-gray-600">Enter the 6-digit code sent to your email to confirm release.</p>
             </div>
             
             <div className="flex gap-2 justify-center my-4">
               {otp.map((digit, index) => (
                 <input
                   key={index}
                   id={`otp-${index}`}
                   type="text"
                   inputMode="numeric"
                   maxLength={1}
                   value={digit}
                   onChange={(e) => handleOtpChange(index, e.target.value)}
                   className={`w-12 h-12 text-center text-lg font-semibold border rounded-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all ${otpError ? 'border-red-500' : 'border-gray-200'}`}
                 />
               ))}
             </div>

             {otpError && (
               <p className="text-red-500 text-sm text-center font-medium">{otpError}</p>
             )}

             <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowOtpModal(false)} disabled={verifyingOtp}>
                    Cancel
                </Button>
                <Button className="flex-1" onClick={handleVerifyRelease} disabled={verifyingOtp}>
                    {verifyingOtp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {verifyingOtp ? 'Verifying...' : 'Verify & Release'}
                </Button>
             </div>
           </Card>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelTrade}
        tradeId={ctx.tradeId}
        cryptoAmount={amountCrypto || 0}
        cryptoCurrency={cryptoCode}
        isProcessing={cancelling}
      />
    </div>
  );
}
