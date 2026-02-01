"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Upload,
  MessageSquare,
  Shield,
  Eye,
} from "lucide-react";

interface P2POrder {
  id: string;
  reference: string; // Order reference like P2P-1767112468832
  buyerName: string;
  cryptoAmount: number;
  fiatAmount: number;
  cryptoCurrency: string;
  fiatCurrency: string;
  paymentMethod: string;
  status:
    | "pending_payment"
    | "awaiting_release"
    | "PAYMENT_CONFIRMED_BY_BUYER"
    | "completed"
    | "disputed";
  createdAt: Date;
  expiresAt: Date;
  paymentProof?: string;
  // Add paymentDetails for Merchant Buy support
  paymentDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    bankCode?: string;
    country?: string;
  };
  side: string; // 'BUY' or 'SELL' from Merchant's perspective? No, 'side' in Order usually is AD side.
}

interface MerchantOrderFlowProps {
  order: P2POrder;
  onComplete: () => void;
  onDispute: () => void;
}

export function MerchantOrderFlow({
  order,
  onComplete,
  onDispute,
}: MerchantOrderFlowProps) {
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [showPaymentProof, setShowPaymentProof] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  // New state for Merchant Buy flow
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(false);

  // Normalize status for comparisons
  const currentStatus = order.status.toLowerCase();

  // Check if Merchant is Buying
  // If order.side is 'SELL' (User is Selling), then Merchant is Buying.
  // Or purely based on requirements: "if its a sell ad where the merchant is buing"
  const isMerchantBuying =
    order.side === "SELL" || (order as any).type === "sell"; // Adjust based on actual data shape

  // Fetch bank details on mount if Merchant Buying
  useState(() => {
    if (isMerchantBuying && currentStatus === "pending_payment") {
      setLoadingDetails(true);
      // Use reference, not ID, as per backend requirement (e.g. P2P-...)
      fetch(`/api/fstack/trade/${order.reference}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.paymentDetails) {
            setBankDetails(data.data.paymentDetails);
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setLoadingDetails(false));
    }
  });

  const timeRemaining = Math.max(
    0,
    Math.floor((order.expiresAt.getTime() - Date.now()) / 1000 / 60),
  );
  const isExpiringSoon = timeRemaining <= 5;

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch("/api/fstack/orders/initiate-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference }),
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
      const res = await fetch("/api/fstack/orders/confirm-release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference, otpCode: otpCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast({
          title: "Crypto Released",
          description: `${order.cryptoAmount} ${order.cryptoCurrency} has been released to the buyer.`,
        });
        setShowOtpModal(false);
        setOtpError("");
        onComplete();
      } else {
        const errorMsg = data.error || data.message || "Invalid OTP code";
        setOtpError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message || "Invalid OTP code",
        variant: "destructive",
      });
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

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleMerchantMarkPaid = async () => {
    setMarkingPaid(true);
    try {
      // Endpoint: /api/fstack/trade/[id]/merchant-paid
      const res = await fetch(
        `/api/fstack/trade/${order.reference}/merchant-paid`,
        {
          // User said "use this to fetch... wait... p2p... reference... initiate-release... confirm-release... merchant-paid"
          // Actually, the user requirement for merchant-paid endpoint was:
          // https://finstack-backend-api.onrender.com/api/trade/P2P-1767127643379/merchant-paid
          // So we use reference.
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        },
      );

      const data = await res.json();
      console.log("Merchant mark paid response:", res.status, data);

      // Relaxed check: if status is 2xx, consider it success even if data.success is missing
      if (res.ok) {
        toast({
          title: "Payment Notification Sent",
          description:
            "Success! The seller has been notified that you have made the payment.",
          duration: 5000,
        });
        // Optional: Call onComplete if we want to move the flow forward?
        // onComplete();
      } else {
        throw new Error(data.error || data.message || "Failed to mark paid");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMarkingPaid(false);
    }
  };

  const handleDispute = async () => {
  try {
    const res = await fetch(`/api/fstack/p2p/${order.reference}/dispute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Merchant reported issue' })
    });
    const data = await res.json();
    
    if (data.success) {
      toast({
        title: "Dispute Submitted",
        description: "Your dispute has been submitted. Admin will review this order.",
      });
      onDispute();
    } else {
      toast({
        title: "Error",
        description: data.error || "Failed to submit dispute",
        variant: "destructive",
      });
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "Failed to submit dispute",
      variant: "destructive",
    });
  }
};

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold mb-1">
              Order #{order.id.slice(0, 8)}
            </h2>
            <p className="text-sm text-gray-600">Buyer: {order.buyerName}</p>
          </div>
          <Badge
            className={
              order.status === "completed"
                ? "bg-green-100 text-green-800"
                : order.status === "disputed"
                  ? "bg-red-100 text-red-800"
                  : order.status === "PAYMENT_CONFIRMED_BY_BUYER"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
            }
          >
            {order.status.replace(/_/g, " ").toUpperCase()}
          </Badge>
        </div>

        <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            {/* Dynamic Label: If Merchant Buying, "You Pay" (Fiat). If Merchant Selling, "You Receive" (Fiat) */}
            <p className="text-xs text-gray-600 mb-1">
              {isMerchantBuying ? "You Pay" : "You Receive"}
            </p>
            <p className="text-lg font-bold">
              {order.fiatAmount.toLocaleString()} {order.fiatCurrency}
            </p>
          </div>
          <div>
            {/* Dynamic Label: If Merchant Buying, "You Receive" (Crypto). If Merchant Selling, "You Release" (Crypto) */}
            <p className="text-xs text-gray-600 mb-1">
              {isMerchantBuying ? "You Receive" : "You Release"}
            </p>
            <p className="text-lg font-bold">
              {order.cryptoAmount} {order.cryptoCurrency}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Payment Method</p>
            <p className="text-sm font-medium">{order.paymentMethod}</p>
          </div>
        </div>

        {/* Timer */}
        <div
          className={`mt-4 p-3 rounded-lg flex items-center gap-3 ${isExpiringSoon ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}
        >
          <Clock
            className={`w-5 h-5 ${isExpiringSoon ? "text-red-600" : "text-blue-600"}`}
          />
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${isExpiringSoon ? "text-red-800" : "text-blue-800"}`}
            >
              {currentStatus === "pending_payment"
                ? isMerchantBuying
                  ? "Please pay the seller"
                  : "Waiting for buyer payment"
                : "Payment received - Verify and release"}
            </p>
            <p
              className={`text-xs ${isExpiringSoon ? "text-red-600" : "text-blue-600"}`}
            >
              Time remaining: {timeRemaining} minutes
            </p>
          </div>
        </div>
      </Card>

      {/* Merchant Buying Flow: Show Bank Details & I Have Paid */}
      {isMerchantBuying && currentStatus === 'pending_payment' && (
         <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Make Payment</h3>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border mb-4">
               <h4 className="font-medium mb-3">Seller Bank Details</h4>
               {loadingDetails ? (
                   <div className="text-sm text-gray-500">Loading details...</div>
               ) : bankDetails ? (
                   <div className="space-y-2">
                       <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Bank Name</span>
                           <span className="font-medium">{bankDetails.bankName}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Account Number</span>
                           <span className="font-medium font-mono">{bankDetails.accountNumber}</span>
                       </div>
                       <div className="flex justify-between">
                           <span className="text-sm text-gray-600">Account Name</span>
                           <span className="font-medium">{bankDetails.accountName}</span>
                       </div>
                   </div>
               ) : (
                   <div className="text-sm text-red-500">Failed to load bank details or none provided.</div>
               )}
            </div>

            <div className="space-y-3">
               <Button 
                   onClick={handleMerchantMarkPaid}
                   disabled={markingPaid || !bankDetails}
                   className="w-full bg-green-600 hover:bg-green-700 text-white"
               >
                   {markingPaid ? 'Processing...' : 'I have made payment'}
               </Button>
               
               {/* Cancel Button for Merchant in Buy Flow */}
               <Button 
                   variant="destructive"
                   className="w-full"
                   onClick={handleDispute}
                   disabled={markingPaid}
               >
                   <XCircle className="w-4 h-4 mr-2" />
                   Cancel Order
               </Button>
            </div>
         </Card>
      )}

      {/* Merchant Selling Flow: Payment Verification (Existing Code) */}
      {!isMerchantBuying && (currentStatus === 'payment_confirmed_by_buyer' || currentStatus === 'paid') && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Verify Payment</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">
                      Verify Payment Carefully
                    </p>
                    <ul className="text-xs text-yellow-700 space-y-1">
                      <li>
                        • Check your bank account or payment app for the exact
                        amount
                      </li>
                      <li>
                        • Verify the sender's name matches the buyer's account
                        name
                      </li>
                      <li>• Check payment reference/memo if provided</li>
                      <li>• Only release crypto after confirming payment</li>
                    </ul>
                  </div>
                </div>
              </div>

              {order.paymentProof && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPaymentProof(!showPaymentProof)}
                    className="mb-2"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {showPaymentProof ? "Hide" : "View"} Payment Proof
                  </Button>
                  {showPaymentProof && (
                    <div className="border rounded-lg p-3 bg-white">
                      <img
                        src={order.paymentProof}
                        alt="Payment proof"
                        className="max-w-full h-auto rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleSendOtp}
                  disabled={sendingOtp}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {sendingOtp ? "Sending OTP..." : "Payment Received"}
                </Button>
                <Button
                  onClick={handleDispute}
                  variant="destructive"
                  disabled={sendingOtp}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Dispute
                </Button>
              </div>
            </div>
          </Card>
        )}

      {/* Waiting for Payment (Merchant Selling) */}
      {!isMerchantBuying && currentStatus === "pending_payment" && (
        <Card className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Waiting for Buyer Payment
              </h3>
              <p className="text-gray-600 text-sm">
                The buyer has been notified to make the payment. You'll be
                alerted once they mark it as paid.
              </p>
            </div>
            <Button onClick={handleDispute} variant="outline" size="sm">
              Report Issue
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
                    setOtpError(""); // Clear error when typing
                    handleOtpChange(index, e.target.value);
                  }}
                  className={`w-12 h-12 text-center text-lg font-semibold ${otpError ? "border-red-500" : ""}`}
                />
              ))}
            </div>

            {/* OTP Error Message */}
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
                {verifyingOtp ? (
                  <>Verifying...</>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm & Release Crypto
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
