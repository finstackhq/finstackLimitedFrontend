"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Loader2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  QrCode, // Added for UI
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithAuth } from "@/components/auth-form";
import { useRouter, useParams } from "next/navigation";
import { TradeCancelScreen } from "./TradeCancelScreen";
import { TradeDisputeScreen } from "./TradeDisputeScreen";
import { TradeCompletionScreen } from "./TradeCompletionScreen";
import { CancelConfirmationDialog } from "./CancelConfirmationDialog";
import { DisputeModal } from "./DisputeModal";

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
    type: "buy" | "sell";
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
    side?: "BUY" | "SELL" | string;
    amountFiat?: number;
    amountCrypto?: number;
    platformFeeCrypto?: number;
    netCryptoAmount?: number;
    marketRate?: number;
    listingRate?: number;
    // Updated to match your API response
    paymentDetails?: {
      alipayAccountName?: string;
      alipayEmail?: string;
      alipayQrImage?: string;
      country?: string;
    };
  };
  status?:
    | "pending_payment"
    | "paid"
    | "awaiting_merchant_confirmation"
    | "completed"
    | "cancelled"
    | "disputed"
    | string;
  cancelledAt?: string;
  cancelledBy?: "buyer" | "merchant" | "system";
  cancelReason?: string;
  completedAt?: string;
  disputedAt?: string;
};

export default function PaymentPage() {
  // Download QR code as blob for better UX
  const downloadQRCode = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `alipay-qr-${tradeId}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast({ title: "Success", description: "QR Code download started" });
    } catch (error) {
      console.error("Download failed", error);
      window.open(imageUrl, "_blank");
    }
  };

  // ...existing code...
  const params = useParams();
  // tradeId declaration moved below, remove duplicate
  // ...existing code...
  // ...existing code...
  const [ctx, setCtx] = useState<StoredTradeContext | null>(null);

  // Debug log for Alipay payment details (moved below ctx declaration)
  useEffect(() => {
    if (ctx && ctx.initiate && ctx.initiate.paymentDetails) {
      console.log("[DEBUG] Alipay paymentDetails:", ctx.initiate.paymentDetails);
    } else {
      console.log("[DEBUG] No Alipay paymentDetails found.", ctx);
    }
  }, [ctx]);
  // Debug: Log ctx and paymentDetails to check Alipay QR presence
  useEffect(() => {
    console.log("PaymentPage ctx:", ctx);
    if (ctx && ctx.initiate) {
      if (ctx.initiate.paymentDetails) {
        console.log(
          "PaymentPage Alipay paymentDetails:",
          ctx.initiate.paymentDetails,
        );
      } else {
        console.log("PaymentPage: No paymentDetails found in ctx.initiate");
      }
    } else {
      console.log("PaymentPage: ctx or ctx.initiate is missing");
    }
  }, [ctx]);
  const tradeId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";
  // Duplicate declaration removed
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [localPaid, setLocalPaid] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`p2p_trade_${tradeId}`);
      if (!raw) {
        setCtx(null);
        setLoading(false);
        router.replace("/dashboard/p2p");
        return;
      }

      const parsed = JSON.parse(raw) as StoredTradeContext;
      setCtx(parsed);
    } catch (e) {
      console.error("Failed to load stored trade context", e);
      setCtx(null);
    } finally {
      setLoading(false);
    }
  }, [tradeId]);

  // 1. KEEP THE TIMER LOGIC (Essential for the UI)
  useEffect(() => {
    if (!ctx) return;
    const paymentWindowMinutes = Number(ctx.paymentWindow) || 15;
    if (!ctx.createdAt) return;

    const computeTime = () => {
      const created = new Date(ctx.createdAt).getTime();
      const windowMs = paymentWindowMinutes * 60 * 1000;
      const expireTime = created + windowMs;
      const now = new Date().getTime();
      const diff = Math.max(0, expireTime - now);

      if (diff === 0) setIsExpired(true);

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    setTimeLeft(computeTime());
    const status = (ctx.status || "pending_payment").toLowerCase();
    if (status === "paid" || status === "completed" || localPaid) return;

    const timer = setInterval(() => {
      setTimeLeft(computeTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [ctx, localPaid]);

  // 2. ADD THE DEBUG LOGIC BELOW IT (To help us find the barcode)
  useEffect(() => {
    if (ctx) {
      const details =
        ctx.initiate?.paymentDetails || (ctx as any).paymentDetails;
      if (details) {
        console.log("✅ Found Alipay Details:", details);
      } else {
        console.warn(
          "❌ No paymentDetails found in ctx.initiate OR ctx root. Entire ctx:",
          ctx,
        );
      }
    }
  }, [ctx]);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  const handleMarkPaid = async () => {
    try {
      setLocalPaid(true);
      setUpdating(true);
      const reference = ctx?.initiate?.reference;
      if (!reference) throw new Error("Trade reference not found");

      const res = await fetchWithAuth("/api/fstack/p2p/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setLocalPaid(false);
        throw new Error(
          data.error || data.message || "Failed to confirm payment",
        );
      }

      updateLocalStatus("paid");
      toast({
        title: "Payment Successful",
        description: "The seller has been notified. Please wait for release.",
      });
    } catch (error: any) {
      setLocalPaid(false);
      toast({
        title: "Error",
        description: error.message || "Failed to confirm payment",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleInitiateRelease = async () => {
    try {
      setUpdating(true);
      const reference = ctx?.initiate?.reference;
      if (!reference) throw new Error("Trade reference not found");

      const res = await fetchWithAuth(
        `/api/fstack/trade/${reference}/initiate-release`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to send OTP");

      setShowOtpModal(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the code.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleVerifyRelease = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    setVerifyingOtp(true);
    try {
      const reference = ctx?.initiate?.reference;
      const res = await fetchWithAuth(
        `/api/fstack/trade/${reference}/confirm-release`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otpCode }),
        },
      );

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Invalid OTP");

      setShowOtpModal(false);
      updateLocalStatus("completed", { completedAt: new Date().toISOString() });
      toast({ title: "Success", description: "Crypto released successfully." });
    } catch (error: any) {
      setOtpError(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancelTrade = async (reason?: string) => {
    setCancelling(true);
    try {
      const reference = ctx?.initiate?.reference;
      const res = await fetchWithAuth(`/api/fstack/p2p/${reference}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok || !data.success)
        throw new Error(data.message || "Cancel failed");

      updateLocalStatus("cancelled", {
        cancelledAt: new Date().toISOString(),
        cancelledBy: "buyer",
        cancelReason: reason,
      });

      setShowCancelDialog(false);
      toast({
        title: "Trade Cancelled",
        description: "Order cancelled successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCancelling(false);
    }
  };

  const updateLocalStatus = (
    newStatus: string,
    additionalData?: Partial<StoredTradeContext>,
  ) => {
    const raw = localStorage.getItem(`p2p_trade_${tradeId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      const next = { ...parsed, status: newStatus, ...additionalData };
      localStorage.setItem(`p2p_trade_${tradeId}`, JSON.stringify(next));
      setCtx(next);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5)
      document.getElementById(`otp-${index + 1}`)?.focus();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!ctx)
    return (
      <div className="text-center py-12">
        <Button onClick={() => router.push("/dashboard/p2p")}>
          Back to P2P
        </Button>
      </div>
    );

  const cryptoCode = ctx.ad?.cryptoCurrency || "USDT";
  const fiatCode = ctx.ad?.fiatCurrency || "NGN";
  const status = ctx.status || "pending_payment";
  const amountFiat = ctx.initiate?.amountFiat;
  const amountCrypto = ctx.initiate?.amountCrypto;
  const price = ctx.initiate?.listingRate || ctx.ad?.price;

  // Screen Switcher
  if (status === "cancelled")
    return (
      <TradeCancelScreen
        tradeId={ctx.tradeId}
        orderId={ctx.initiate?.reference}
        cryptoCurrency={cryptoCode}
        fiatCurrency={fiatCode}
        cryptoAmount={amountCrypto || 0}
        fiatAmount={amountFiat || 0}
        cancelledAt={ctx.cancelledAt || ""}
        cancelledBy={ctx.cancelledBy}
        cancelReason={ctx.cancelReason}
        wasPaymentMade={localPaid}
      />
    );
  if (
    status === "disputed" ||
    (status === "paid" && ctx.initiate?.side !== "SELL")
  )
    return (
      <TradeDisputeScreen
        tradeId={ctx.tradeId}
        reference={ctx.initiate?.reference || ""}
        paidAt={new Date(ctx.createdAt)}
        cryptoCurrency={cryptoCode}
        fiatCurrency={fiatCode}
        cryptoAmount={amountCrypto || 0}
        fiatAmount={amountFiat || 0}
        disputeThresholdMinutes={15}
        onDisputeSubmitted={() =>
          updateLocalStatus("disputed", {
            disputedAt: new Date().toISOString(),
          })
        }
      />
    );
  if (status === "completed")
    return (
      <TradeCompletionScreen
        tradeId={ctx.tradeId}
        reference={ctx.initiate?.reference || ""}
        side={ctx.initiate?.side === "SELL" ? "SELL" : "BUY"}
        cryptoCurrency={cryptoCode}
        fiatCurrency={fiatCode}
        cryptoAmount={amountCrypto || 0}
        fiatAmount={amountFiat || 0}
        price={price || 0}
        completedAt={ctx.completedAt || ""}
        merchantId="merchant"
        merchantName={ctx.sellerName || "Merchant"}
      />
    );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {ctx.initiate?.side === "SELL" ? "Sell" : "Buy"} {cryptoCode}
            <Badge
              variant={status === "pending_payment" ? "outline" : "default"}
            >
              {status.replace("_", " ")}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm">
            Ref: {ctx.initiate?.reference}
          </p>
        </div>

        {status === "pending_payment" && !isExpired && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Time remaining
                </p>
                <p className="text-xl font-bold font-mono text-primary">
                  {timeLeft}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Amount to {ctx.initiate?.side === "SELL" ? "Receive" : "Pay"}
                </span>
                <span className="text-xl font-bold">
                  {amountFiat} {fiatCode}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground">
                  Amount to {ctx.initiate?.side === "SELL" ? "Send" : "Receive"}
                </span>
                <span className="text-xl font-bold">
                  {amountCrypto} {cryptoCode}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                {ctx.initiate?.side === "SELL"
                  ? "Buyer will use these details"
                  : "Transfer funds to the seller below"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* ALIPAY QR CODE SECTION - Always show if alipayQrImage is present */}
              {ctx.initiate?.paymentDetails?.alipayQrImage && (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
                    <QrCode className="h-5 w-5" />
                    <span>Alipay QR Code</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-md mb-4 border border-gray-100 flex flex-col items-center">
                    <img
                      src={ctx.initiate?.paymentDetails?.alipayQrImage}
                      alt="Alipay QR"
                      className="w-48 h-48 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/200?text=QR+Error";
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => downloadQRCode(ctx.initiate?.paymentDetails?.alipayQrImage!)}
                    >
                      Download QR
                    </Button>
                  </div>
                  <div className="text-center space-y-2 w-full max-w-[280px]">
                    <div className="bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm text-left">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Account Name</p>
                      <p className="text-sm font-bold">{ctx.initiate?.paymentDetails?.alipayAccountName || ctx.sellerName}</p>
                    </div>
                    <div className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                      <div className="text-left overflow-hidden">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Alipay Email/ID</p>
                        <p className="text-sm font-medium truncate">{ctx.initiate?.paymentDetails?.alipayEmail || "N/A"}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCopy(ctx.initiate?.paymentDetails?.alipayEmail || "")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Methods */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  {ctx.paymentMethods?.map((m) => (
                    <Badge key={m} variant="secondary">
                      {m}
                    </Badge>
                  ))}
                </div>
                {ctx.sellerName && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Seller Name</span>
                    <span className="font-semibold">{ctx.sellerName}</span>
                  </div>
                )}
                {ctx.instructions && (
                  <div className="pt-2 border-t mt-2">
                    <span className="text-xs text-muted-foreground uppercase font-bold">
                      Instructions
                    </span>
                    <p className="text-sm mt-1">{ctx.instructions}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              size="lg"
              className={`w-full text-lg font-bold h-14 ${ctx.initiate?.side === "SELL" ? "bg-blue-600 hover:bg-blue-700" : "bg-green-600 hover:bg-green-700"}`}
              onClick={
                ctx.initiate?.side === "SELL"
                  ? handleInitiateRelease
                  : handleMarkPaid
              }
              disabled={updating || isExpired}
            >
              {updating ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 mr-2" />
              )}
              {ctx.initiate?.side === "SELL"
                ? "I have received payment"
                : "I have paid"}
            </Button>

            {ctx.initiate?.side !== "SELL" && (
              <Button
                variant="destructive"
                className="w-full h-12"
                onClick={() => setShowCancelDialog(true)}
                disabled={updating}
              >
                <XCircle className="h-5 w-5 mr-2" /> Cancel Order
              </Button>
            )}

            <Button
              variant="outline"
              className="w-full h-12"
              onClick={() => setShowDisputeModal(true)}
            >
              <AlertTriangle className="h-5 w-5 mr-2" /> Report Issue
            </Button>
          </div>
        </div>

        {/* Support Sidebar */}
        <div className="space-y-6">
          <Card className="p-6 text-center space-y-4">
            <CardTitle className="text-lg">Need Help?</CardTitle>
            <div className="space-y-2 text-sm">
              <p>Contact us via Whatsapp:</p>
              <a
                href="https://wa.me/2348164458437"
                className="text-green-600 font-bold block"
              >
                +234 816 445 8437
              </a>
              <Separator />
              <p>Email Support:</p>
              <a
                href="mailto:hello@usefinstack.co"
                className="text-blue-600 font-bold block"
              >
                hello@usefinstack.co
              </a>
            </div>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Confirm Release</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Enter the 6-digit code sent to your email.
            </p>
            <div className="flex gap-2 justify-center mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  className="w-12 h-14 text-center text-xl font-bold border rounded-lg focus:ring-2 focus:ring-primary outline-none"
                />
              ))}
            </div>
            {otpError && (
              <p className="text-red-500 text-sm mb-4">{otpError}</p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowOtpModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleVerifyRelease}
                disabled={verifyingOtp}
              >
                {verifyingOtp ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  "Verify & Release"
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <CancelConfirmationDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        onConfirm={handleCancelTrade}
        tradeId={ctx.tradeId}
        cryptoAmount={amountCrypto || 0}
        cryptoCurrency={cryptoCode}
        isProcessing={cancelling}
      />

      <DisputeModal
        open={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        onSubmit={async (reason, evidence) => {
          const reference = ctx?.initiate?.reference;
          const formData = new FormData();
          formData.append("reason", reason);
          if (evidence) formData.append("evidence", evidence);
          const res = await fetchWithAuth(
            `/api/fstack/p2p/${reference}/dispute`,
            {
              method: "POST",
              body: formData,
            },
          );
          const data = await res.json();
          if (data.success) {
            toast({
              title: "Dispute Submitted",
              description: "Support will contact you soon.",
            });
            router.push("/dashboard/p2p");
          } else {
            throw new Error(data.message);
          }
        }}
      />
    </div>
  );
}
