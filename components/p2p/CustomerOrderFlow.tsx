'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Upload,
  Copy,
  Check,
  MessageSquare,
  CreditCard,
  QrCode
} from 'lucide-react';

interface P2POrder {
  id: string;
  sellerName: string;
  cryptoAmount: number;
  fiatAmount: number;
  cryptoCurrency: string;
  fiatCurrency: string;
  paymentMethod: string;
  status: 'pending_payment' | 'awaiting_release' | 'PAYMENT_CONFIRMED_BY_BUYER' | 'completed' | 'disputed';
  createdAt: Date;
  expiresAt: Date;
  // Payment details from merchant
  alipayAccountName?: string;
  alipayEmail?: string;
  alipayQrImage?: string;
  customAccountDetails?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  bankName?: string;
}

interface CustomerOrderFlowProps {
  order: P2POrder;
  onMarkPaid: (proof?: string) => void;
  onCancel: () => void;
}

export function CustomerOrderFlow({ order, onMarkPaid, onCancel }: CustomerOrderFlowProps) {
  const { toast } = useToast();
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState('');

  const timeRemaining = Math.max(0, Math.floor((order.expiresAt.getTime() - Date.now()) / 1000 / 60));
  const isExpiringSoon = timeRemaining <= 5;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPaymentProof(ev.target?.result as string);
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMarkAsPaid = () => {
    if (!paymentProof) {
      toast({
        title: 'Payment Proof Required',
        description: 'Please upload a screenshot or photo of your payment.',
        variant: 'destructive'
      });
      return;
    }

    onMarkPaid(paymentProof);
    toast({
      title: 'Payment Marked as Sent',
      description: 'Waiting for seller to verify and release crypto.'
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast({
      title: 'Copied',
      description: `${label} copied to clipboard`
    });
  };

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">Order #{order.id.slice(0, 8)}</h2>
            <p className="text-sm text-gray-600">Seller: {order.sellerName}</p>
          </div>
          <Badge className={
            order.status === 'completed' ? 'bg-green-100 text-green-800' :
            order.status === 'disputed' ? 'bg-red-100 text-red-800' :
            (order.status === 'awaiting_release' || order.status === 'PAYMENT_CONFIRMED_BY_BUYER') ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }>
            {order.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">You Pay</p>
            <p className="text-lg font-bold">{order.fiatAmount.toLocaleString()} {order.fiatCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">You Receive</p>
            <p className="text-lg font-bold">{order.cryptoAmount} {order.cryptoCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Payment Method</p>
            <p className="text-sm font-medium">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Timer */}
        <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${isExpiringSoon ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
          <Clock className={`w-5 h-5 ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium ${isExpiringSoon ? 'text-red-800' : 'text-blue-800'}`}>
              {order.status === 'pending_payment' ? 'Complete payment within' : 'Waiting for seller to release crypto'}
            </p>
            <p className={`text-xs ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`}>
              Time remaining: {timeRemaining} minutes
            </p>
          </div>
        </div>
      </Card>

      {/* Payment Instructions */}
      {order.status === 'pending_payment' && (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Payment Details</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">Important Payment Instructions</p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Pay exactly {order.fiatAmount.toLocaleString()} {order.fiatCurrency}</li>
                      <li>• Use only the payment method selected</li>
                      <li>• Upload payment proof after completing transaction</li>
                      <li>• Do not cancel after payment - wait for seller to release crypto</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Bank Transfer Details */}
              {order.paymentMethod === 'Bank Transfer' && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-3">Bank Account Details</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Bank Name</p>
                        <p className="font-medium">{order.bankName || 'GTBank'}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600">Account Number</p>
                        <p className="font-medium font-mono">{order.bankAccountNumber || '1234567890'}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(order.bankAccountNumber || '1234567890', 'Account number')}
                      >
                        {copied === 'Account number' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Account Name</p>
                      <p className="font-medium">{order.bankAccountName || order.sellerName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Alipay Details */}
              {order.paymentMethod === 'Alipay' && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <QrCode className="w-5 h-5" />
                    Alipay Payment Details
                  </h4>
                  <div className="space-y-3">
                    {order.alipayAccountName && (
                      <div>
                        <p className="text-xs text-gray-600">Account Name</p>
                        <p className="font-medium">{order.alipayAccountName}</p>
                      </div>
                    )}
                    {order.alipayEmail && (
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-600">Email/Phone</p>
                          <p className="font-medium">{order.alipayEmail}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(order.alipayEmail!, 'Alipay contact')}
                        >
                          {copied === 'Alipay contact' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    )}
                    {order.alipayQrImage && (
                      <div>
                        <p className="text-xs text-gray-600 mb-2">Scan QR Code to Pay</p>
                        <div className="bg-white p-4 rounded-lg border-2 inline-block">
                          <img 
                            src={order.alipayQrImage} 
                            alt="Alipay QR Code" 
                            className="w-48 h-48 object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Account Details */}
              {order.paymentMethod === 'Custom Account' && order.customAccountDetails && (
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h4 className="font-medium mb-3">Payment Instructions</h4>
                  <p className="text-sm whitespace-pre-wrap">{order.customAccountDetails}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Upload Payment Proof */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Upload Payment Proof</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Payment Screenshot/Receipt *
                </label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  {paymentProof ? (
                    <div className="space-y-3">
                      <img 
                        src={paymentProof} 
                        alt="Payment proof" 
                        className="max-w-full h-48 object-contain mx-auto rounded"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentProof(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 mb-1">Click to upload payment proof</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Add any additional notes..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={!paymentProof}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I Have Paid
                </Button>
                <Button
                  onClick={onCancel}
                  variant="outline"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel Order
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Waiting for Release */}
      {(order.status === 'awaiting_release' || order.status === 'PAYMENT_CONFIRMED_BY_BUYER') && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Waiting for Seller</h3>
              <p className="text-gray-600 text-sm">
                Your payment has been submitted. The seller is verifying and will release the crypto shortly.
              </p>
            </div>
            {paymentProof && (
              <div>
                <p className="text-xs text-gray-600 mb-2">Your Payment Proof</p>
                <img 
                  src={paymentProof} 
                  alt="Payment proof" 
                  className="max-w-xs h-32 object-contain mx-auto rounded border"
                />
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Chat/Communication */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold">Order Chat</h3>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          Chat functionality coming soon. Use the notes section for now.
        </div>
      </Card>
    </div>
  );
}
