'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Upload,
  Copy,
  Check,
  CreditCard,
  QrCode,
  Download,
  Shield,
  MessageSquare,
} from 'lucide-react';
import { DisputeModal } from './DisputeModal';

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
  side?: 'BUY' | 'SELL';
  reference?: string; 
}

interface CustomerOrderFlowProps {
  order: P2POrder;
  onMarkPaid: (proof?: string) => void;
  onCancel: () => void;
  onDispute?: () => void; // For raising a dispute
  onRelease?: () => void; // For selling flow
}

export function CustomerOrderFlow({ order, onMarkPaid, onCancel, onRelease, onDispute }: CustomerOrderFlowProps) {
  const currentStatus = order.status.toLowerCase();
  const { toast } = useToast();
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState('');

  // OTP State for Selling Flow
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const isUserSelling = order.side?.toUpperCase() === 'SELL';
  
  // Also support dynamic payment proof view for Seller
  // Also support dynamic payment proof view for Seller
  const [viewProof, setViewProof] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  // Parse expiresAt correctly
  const expiresAtDate = new Date(order.expiresAt);
  const timeRemaining = Math.max(0, Math.floor((expiresAtDate.getTime() - Date.now()) / 1000 / 60));
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
    // OPTIONAL PROOF:
    // User requested that proof is NOT mandatory for generic "I Have Paid"
    // if (!paymentProof) { ... } -> Removed check

    onMarkPaid(paymentProof || undefined);
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

  const handleDisputeClick = () => {
    console.log("Opening dispute modal");
    setShowDisputeModal(true);
    // Temporary toast to verify click works (remove later if annoying)
    // toast({ title: "Opening Dispute Form..." }); 
  };

  const submitDispute = async (reason: string, evidence: File | null) => {
    try {
        const formData = new FormData();
        formData.append('reason', reason);
        if (evidence) {
            formData.append('evidence', evidence);
        }

        const tradeId = order.reference || order.id;
        const res = await fetch(`/api/fstack/p2p/${tradeId}/dispute`, {
            method: 'POST',
            body: formData, 
        });
        
        const data = await res.json();

        if (data.success) {
            toast({
                title: "Dispute Submitted",
                description: "Your dispute has been submitted. Support will review your case.",
            });
            if (onDispute) onDispute();
        } else {
            throw new Error(data.error || "Failed to submit dispute");
        }
    } catch (error: any) {
        toast({
            title: "Error",
            description: error.message || "Failed to submit dispute",
            variant: "destructive",
        });
        throw error; 
    }
  };

  // --- Selling Logic (Release Crypto) ---
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const reference = order.reference || order.id;
      // UPDATED ENDPOINT to match PaymentPage
      const res = await fetch(`/api/fstack/trade/${reference}/initiate-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "OTP Sent",
          description: "A 6-digit code has been sent to your email.",
        });
        setShowOtpModal(true);
      } else {
        throw new Error(data.error || data.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to initiate release",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyAndRelease = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter all 6 digits",
        variant: "destructive",
      });
      return;
    }

    setVerifyingOtp(true);
    try {
      const reference = order.reference || order.id;
      // UPDATED ENDPOINT to match PaymentPage
      const res = await fetch(`/api/fstack/trade/${reference}/confirm-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpCode: otpCode }), // Send otpCode as expected by new endpoint
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Crypto Released",
          description: `${order.cryptoAmount} ${order.cryptoCurrency} has been released.`,
        });
        setShowOtpModal(false);
        setOtpError("");
        if (onRelease) onRelease();
      } else {
         const errorMsg = data.error || data.message || "Invalid OTP code";
         setOtpError(errorMsg);
         throw new Error(errorMsg);
      }
    } catch (error: any) {
       // toast handled by UI state or ignored
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^[0-9]*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
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
            currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
            currentStatus === 'disputed' ? 'bg-red-100 text-red-800' :
            (currentStatus === 'awaiting_release' || currentStatus === 'payment_confirmed_by_buyer') ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }>
            {currentStatus.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600 mb-1">{isUserSelling ? 'You Receive' : 'You Pay'}</p>
            <p className="text-lg font-bold">{order.fiatAmount.toLocaleString()} {order.fiatCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">{isUserSelling ? 'You Release' : 'You Receive'}</p>
            <p className="text-lg font-bold">{order.cryptoAmount} {order.cryptoCurrency}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Payment Method</p>
            <p className="text-sm font-medium">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Timer */}
        {/* Timer or Status Message */}
        {/* Timer or Status Message */}
        {currentStatus === 'completed' ? (
          <div className="mt-4 p-3 rounded-lg flex items-center gap-3 bg-green-50 border border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-800">
                This order has been completed
              </p>
            </div>
          </div>
        ) : (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${isExpiringSoon ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
            <Clock className={`w-5 h-5 ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`} />
            <div className="flex-1">
              <p className={`text-sm font-medium ${isExpiringSoon ? 'text-red-800' : 'text-blue-800'}`}>
                {currentStatus === 'pending_payment' ? 'Complete payment within' : 'Waiting for seller to release crypto'}
              </p>
              <p className={`text-xs ${isExpiringSoon ? 'text-red-600' : 'text-blue-600'}`}>
                Time remaining: {timeRemaining} minutes
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Payment Instructions (User Buying) */}
      {!isUserSelling && currentStatus === 'pending_payment' && (
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
                      <div className="space-y-3">
                        <p className="text-xs text-gray-600">Scan QR Code to Pay</p>
                        <div className="bg-white p-4 rounded-lg border-2 inline-block">
                          <img 
                            src={order.alipayQrImage} 
                            alt="Alipay QR Code" 
                            className="w-48 h-48 object-contain"
                          />
                        </div>
                        {/* Download QR Code Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = order.alipayQrImage!;
                            link.download = `qr-code-${order.id}.png`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Save QR Code
                        </Button>
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

          {/* Action Buttons */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Confirm Payment</h3>
            <div className="flex gap-3">
              <Button
                onClick={handleMarkAsPaid}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I Have Paid
              </Button>
              <Button
                onClick={onCancel}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
              <Button variant="outline" onClick={handleDisputeClick} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                 Report Issue
              </Button>
            </div>
          </Card>
        </>
      )}

      {/* User Selling: Waiting for Merchant Payment */}
      {isUserSelling && currentStatus === 'pending_payment' && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Waiting for Merchant Payment</h3>
              <p className="text-gray-600 text-sm">
                The merchant has been notified to make payment to your account.
                You'll see the "I Have Received Payment" button once they mark it as paid.
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button onClick={onCancel} variant="destructive" size="sm">
                <XCircle className="w-4 h-4 mr-2" /> Cancel Order
              </Button>
              <Button variant="outline" onClick={handleDisputeClick} size="sm" className="text-orange-600 border-orange-200 hover:bg-orange-50">
                Report Issue
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* User Selling: Verify & Release (Only when Merchant has marked paid) */}
      {isUserSelling && ['merchant_paid', 'awaiting_release', 'payment_confirmed_by_buyer', 'paid'].includes(currentStatus) && (
        <Card className="p-6">
             <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Verify Payment & Release</h3>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 mb-1">
                      Merchant Has Paid!
                    </p>
                    <p className="text-xs text-green-700">
                      The merchant has marked the order as paid. Please verify you received {order.fiatAmount} {order.fiatCurrency} before releasing.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Verify Payment Carefully
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>• Check your bank account for exact amount: {order.fiatAmount} {order.fiatCurrency}</li>
                      <li>• Verify sender name (Merchant)</li>
                      <li>• DO NOT release if you haven't received the money</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {sendingOtp ? "Sending OTP..." : "I Have Received Payment"}
                </Button>
                <Button onClick={onCancel} variant="destructive">
                  <XCircle className="w-4 h-4 mr-2" /> Cancel
                </Button>
                <Button variant="outline" onClick={handleDisputeClick} className="text-orange-600 border-orange-200 hover:bg-orange-50">
                   Report Issue
                </Button>
              </div>
            </div>
        </Card>
      )}

      {/* Waiting for Release (User Buying) */}
      {!isUserSelling && (currentStatus === 'awaiting_release' || currentStatus === 'payment_confirmed_by_buyer') && (
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
             <Button variant="ghost" onClick={handleDisputeClick} className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 mt-2">
                 Report Issue / Dispute
              </Button>
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

    {/* OTP Modal */}
    {showOtpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Enter OTP Code</h3>
              <p className="text-sm text-gray-600">
                We've sent a 6-digit code to your email
              </p>
            </div>

            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    setOtpError("");
                    handleOtpChange(index, e.target.value);
                  }}
                  className={`w-12 h-12 text-center text-lg font-semibold ${otpError ? "border-red-500" : ""}`}
                />
              ))}
            </div>

            {otpError && (
              <p className="text-red-500 text-sm text-center font-medium">
                {otpError}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp(["", "", "", "", "", ""]);
                  setOtpError("");
                }}
                className="flex-1"
                disabled={verifyingOtp}
              >
                Cancel
              </Button>
              <Button
                onClick={handleVerifyAndRelease}
                disabled={verifyingOtp}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {verifyingOtp ? "Verifying..." : "Confirm & Release"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Dispute Modal */}
      <DisputeModal 
        open={showDisputeModal} 
        onClose={() => {
            console.log("Closing dispute modal");
            setShowDisputeModal(false);
        }} 
        onSubmit={submitDispute} 
      />
    </div>
  );
}
