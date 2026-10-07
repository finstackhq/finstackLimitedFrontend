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
  QrCode, // Added for UI
  XCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
    expiresAt?: string;
    marketRate?: number;
    listingRate?: number;
    // Updated to match your API response
    paymentDetails?: {
      type?: string;
      alipayAccountName?: string;
      alipayQrImage?: string;
      country?: string;
      [key: string]: any;
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
  expiresAt?: string;
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
  const [ctx, setCtx] = useState<StoredTradeContext | null>(null);

  // Removed invalid useEffect blocks and stray comma expressions
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
  // State for enlarged QR modal
  const [showQrModal, setShowQrModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [localPaid, setLocalPaid] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [actionError, setActionError] = useState("");
  const [canDispute, setCanDispute] = useState(false);
  const [tradeLoaded, setTradeLoaded] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const fetchOnce = (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("accessToken");
    return fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
  };

  const refreshTrade = async (current: StoredTradeContext | null = ctx) => {
    if (!current) return null;
    const hasNgnWallet = async () => {
      try {
        const walletResponse = await fetchOnce(
          "/api/fstack/wallet/user-balances",
        );
        const walletResult = await walletResponse.json();
        return (
          walletResponse.ok &&
          Array.isArray(walletResult.data) &&
          walletResult.data.some(
            (wallet: any) =>
              wallet.currency === "NGN" && wallet.provider === "NOMBA",
          )
        );
      } catch {
        return false;
      }
    };

    if (current.ad?.cryptoCurrency === "NGN" && !(await hasNgnWallet())) {
      setCtx(null);
      router.replace("/dashboard/p2p");
      return null;
    }

    const reference = current.initiate?.reference || tradeId;
    const response = await fetchOnce(
      `/api/fstack/p2p/trade/${encodeURIComponent(reference)}`,
    );
    const result = await response.json();
    if (response.status === 403) {
      toast({
        title: "Trade unavailable",
        description:
          result.message || result.error || "This trade is not yours to view.",
        variant: "destructive",
      });
      setCtx(null);
      router.replace("/dashboard/p2p/orders");
      return null;
    }
    if (!response.ok) {
      throw new Error(
        result.message || result.error || "Unable to refresh this trade",
      );
    }

    const trade = result.data || result.trade || result;
    if (!trade || typeof trade.status !== "string") {
      throw new Error("Trade response did not include a status");
    }
    const isNgnTrade =
      current.ad?.cryptoCurrency === "NGN" ||
      [trade.currencySource, trade.currencyTarget, trade.asset].includes("NGN");
    if (isNgnTrade && current.ad?.cryptoCurrency !== "NGN") {
      if (!(await hasNgnWallet())) {
        setCtx(null);
        router.replace("/dashboard/p2p");
        return null;
      }
    }

    const next: StoredTradeContext = {
      ...current,
      status: trade.status || current.status,
      expiresAt: trade.expiresAt || current.expiresAt,
      completedAt: trade.settledAt || current.completedAt,
      initiate: {
        ...current.initiate,
        reference: trade.reference || current.initiate?.reference,
        side: trade.side || current.initiate?.side,
        amountFiat: trade.amountFiat ?? current.initiate?.amountFiat,
        amountCrypto: trade.amountCrypto ?? current.initiate?.amountCrypto,
        platformFeeCrypto:
          trade.platformFeeCrypto ?? current.initiate?.platformFeeCrypto,
        netCryptoAmount:
          trade.netCryptoAmount ?? current.initiate?.netCryptoAmount,
        expiresAt: trade.expiresAt || current.initiate?.expiresAt,
        paymentDetails:
          trade.paymentDetails || current.initiate?.paymentDetails,
      },
    };
    localStorage.setItem(`p2p_trade_${tradeId}`, JSON.stringify(next));
    setCtx(next);
    setTradeLoaded(true);
    return next;
  };

  const refreshBalances = async () => {
    try {
      const response = await fetchOnce("/api/fstack/wallet/user-balances");
      if (!response.ok) throw new Error("Unable to refresh wallet balances");
      await response.json();
    } catch {
      toast({
        title: "Balance refresh failed",
        description: "Refresh your wallet to see the latest balance.",
        variant: "destructive",
      });
    }
  };

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
      void refreshTrade(parsed).catch((error) => {
        setActionError(error.message || "Unable to refresh this trade");
      }).finally(() => setLoading(false));
    } catch (e) {
      console.error("Failed to load stored trade context", e);
      setCtx(null);
      setLoading(false);
    }
  }, [tradeId]);

  // 1. KEEP THE TIMER LOGIC (Essential for the UI)
  useEffect(() => {
    if (!ctx) return;
    const expiresAt = ctx.expiresAt || ctx.initiate?.expiresAt;
    if (!expiresAt) return;

    const computeTime = () => {
      const expireTime = new Date(expiresAt).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, expireTime - now);

      setIsExpired(diff === 0);

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    setTimeLeft(computeTime());
    const status = (ctx.status || "PENDING_PAYMENT").toUpperCase();
    if (["COMPLETED", "CANCELLED", "CANCELLED_REVERSED", "FAILED"].includes(status) || localPaid) return;

    const timer = setInterval(() => {
      setTimeLeft(computeTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [ctx, localPaid]);

  const handleMarkPaid = async () => {
    try {
      setActionError("");
      setCanDispute(false);
      setLocalPaid(true);
      setUpdating(true);
      const reference = ctx?.initiate?.reference;
      if (!reference) throw new Error("Trade reference not found");

      const res = await fetchOnce("/api/fstack/p2p/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();
      if (!res.ok || data.success === false) {
        setLocalPaid(false);
        throw new Error(
          data.error || data.message || "Failed to confirm payment",
        );
      }

      updateLocalStatus(data.data?.status || "PAYMENT_CONFIRMED_BY_BUYER");
      void refreshTrade().catch((error) => setActionError(error.message));
      toast({
        title: "Payment Successful",
        description: "The seller has been notified. Please wait for release.",
      });
    } catch (error: any) {
      setLocalPaid(false);
      setActionError(error.message || "Failed to confirm payment");
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
      setActionError("");
      setUpdating(true);
      const reference = ctx?.initiate?.reference;
      if (!reference) throw new Error("Trade reference not found");

      const res = await fetchOnce(
        `/api/fstack/trade/${reference}/initiate-release`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || data.error || "Failed to send OTP");

      setShowOtpModal(true);
      toast({
        title: "OTP Sent",
        description: "Check your email for the code.",
      });
    } catch (error: any) {
      setActionError(error.message || "Failed to send OTP");
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
      setActionError("");
      const reference = ctx?.initiate?.reference;
      const res = await fetchOnce(
        `/api/fstack/trade/${reference}/confirm-release`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ otpCode }),
        },
      );

      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || data.error || "Invalid OTP");

      setShowOtpModal(false);
      updateLocalStatus(data.data?.status || "COMPLETED", {
        completedAt: data.data?.settledAt || new Date().toISOString(),
      });
      void refreshBalances();
      void refreshTrade().catch((error) => setActionError(error.message));
      toast({ title: "Success", description: "Crypto released successfully." });
    } catch (error: any) {
      setActionError(error.message || "Invalid OTP");
      setOtpError(error.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleCancelTrade = async (reason?: string) => {
    setCancelling(true);
    try {
      setActionError("");
      setCanDispute(false);
      const reference = ctx?.initiate?.reference;
      const res = await fetchOnce(`/api/fstack/p2p/${reference}/cancel`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok || data.success === false)
        throw new Error(data.message || data.error || "Cancel failed");

      updateLocalStatus(data.data?.status || "CANCELLED_REVERSED", {
        cancelledAt: data.data?.cancelledAt || new Date().toISOString(),
        cancelledBy: "buyer",
        cancelReason: reason,
      });
      void refreshBalances();
      void refreshTrade().catch((error) => setActionError(error.message));

      setShowCancelDialog(false);
      toast({
        title: "Trade Cancelled",
        description: "Order cancelled successfully.",
      });
    } catch (error: any) {
      setActionError(error.message || "Cancel failed");
      if (error.message?.includes("409") || /after payment|status/i.test(error.message)) {
        setCanDispute(true);
      }
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
  if (!tradeLoaded)
    return (
      <div className="mx-auto max-w-lg space-y-4 py-12 text-center">
        <h1 className="text-xl font-semibold">Unable to load this trade</h1>
        <p className="text-sm text-destructive">
          {actionError || "Refresh the trade to check its latest status."}
        </p>
        <Button
          onClick={() =>
            void refreshTrade()
              .then(() => setActionError(""))
              .catch((error) => setActionError(error.message))
          }
        >
          Refresh trade
        </Button>
      </div>
    );

  const cryptoCode = ctx.ad?.cryptoCurrency || "USDT";
  const fiatCode = ctx.ad?.fiatCurrency || "NGN";
  const status = (ctx.status || "PENDING_PAYMENT").toUpperCase();
  const amountFiat = ctx.initiate?.amountFiat;
  const amountCrypto = ctx.initiate?.amountCrypto;
  const netCryptoAmount = ctx.initiate?.netCryptoAmount;
  const price = ctx.initiate?.listingRate || ctx.ad?.price;
  const isBuyerSide = ctx.initiate?.side?.toUpperCase() === "BUY";
  const isSellerSide = ctx.initiate?.side?.toUpperCase() === "SELL";
  const canConfirmPayment =
    tradeLoaded && isBuyerSide && status === "PENDING_PAYMENT" && !localPaid;
  const canInitiateRelease =
    tradeLoaded &&
    isSellerSide &&
    !showOtpModal &&
    ["PAYMENT_CONFIRMED_BY_BUYER", "MERCHANT_PAID"].includes(status);
  const canCancel =
    tradeLoaded &&
    status === "PENDING_PAYMENT" &&
    (isBuyerSide || isExpired);
  const canOpenDispute = tradeLoaded && [
    "PENDING_PAYMENT",
    "MERCHANT_PAID",
    "PAYMENT_CONFIRMED_BY_BUYER",
  ].includes(status);
  const paymentDetails = ctx.initiate?.paymentDetails;

  // Screen Switcher
  if (["CANCELLED", "CANCELLED_REVERSED"].includes(status))
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
  if (["DISPUTE", "DISPUTE_PENDING", "DISPUTE_RESOLVED"].includes(status))
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
          updateLocalStatus("DISPUTE_PENDING", {
            disputedAt: new Date().toISOString(),
          })
        }
      />
    );
  if (status === "COMPLETED")
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
              variant={status === "PENDING_PAYMENT" ? "outline" : "default"}
            >
              {status.replaceAll("_", " ")}
            </Badge>
          </h1>
          <p className="text-muted-foreground text-sm">
            Ref: {ctx.initiate?.reference}
          </p>
        </div>

        {status === "PENDING_PAYMENT" && !isExpired && (
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
                  {ctx.initiate?.side === "SELL"
                    ? amountCrypto
                    : (netCryptoAmount ?? amountCrypto)} {cryptoCode}
                </span>
              </div>
              {ctx.initiate?.platformFeeCrypto !== undefined && (
                <div className="flex justify-between items-center px-3 text-sm">
                  <span className="text-muted-foreground">Platform fee</span>
                  <span>
                    {ctx.initiate.platformFeeCrypto} {cryptoCode}
                  </span>
                </div>
              )}
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
              {paymentDetails?.type === "ALIPAY" &&
                paymentDetails.alipayQrImage && (
                <>
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/50">
                    <div className="flex items-center gap-2 mb-4 text-blue-700 font-bold">
                      <QrCode className="h-5 w-5" />
                      <span>Alipay QR Code</span>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-md mb-4 border border-gray-100 flex flex-col items-center">
                      <img
                        src={ctx.initiate?.paymentDetails?.alipayQrImage}
                        alt="Alipay QR"
                        className="w-48 h-48 object-contain cursor-zoom-in"
                        onClick={() => setShowQrModal(true)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://placehold.co/200?text=QR+Error";
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() =>
                          downloadQRCode(
                            ctx.initiate?.paymentDetails?.alipayQrImage!,
                          )
                        }
                      >
                        Download QR
                      </Button>
                    </div>
                    <div className="text-center space-y-2 w-full max-w-[280px]">
                      <div className="bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm text-left">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">
                          Account Name
                        </p>
                        <p className="text-sm font-bold">
                          {ctx.initiate?.paymentDetails?.alipayAccountName ||
                            ctx.sellerName}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Modal for enlarged QR */}
                  {showQrModal && (
                    <div
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                      onClick={() => setShowQrModal(false)}
                    >
                      <div
                        className="bg-white rounded-lg p-6 flex flex-col items-center relative"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <img
                          src={ctx.initiate?.paymentDetails?.alipayQrImage}
                          alt="Alipay QR Large"
                          className="h-96 w-96 object-contain rounded border mb-4"
                        />
                        <button
                          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                          onClick={() => setShowQrModal(false)}
                          aria-label="Close"
                        >
                          &times;
                        </button>
                        <div className="text-xs text-gray-500">
                          Tap outside to close
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {paymentDetails && (
                <div className="border rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-sm">
                    {paymentDetails.type || "Payment"} details
                  </h3>
                  {Object.entries(paymentDetails)
                    .filter(
                      ([key, value]) =>
                        key !== "type" &&
                        !/email|qr/i.test(key) &&
                        typeof value === "string" &&
                        value.length > 0,
                    )
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between gap-3 text-sm"
                      >
                        <span className="text-muted-foreground">
                          {key.replace(/([A-Z])/g, " $1")}
                        </span>
                        <span className="text-right break-all">{value}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Improved Payment Methods Styling */}
              {ctx.paymentMethods && ctx.paymentMethods.length > 0 && (
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="mb-2 font-semibold text-gray-700">Other Payment Methods</div>
                  <div className="flex flex-col gap-3">
                    {ctx.paymentMethods.map((method, idx) => {
                      // Try to parse method as "Label - Value" or fallback
                      const [label, ...rest] = method.split("-");
                      const value = rest.join("-").trim();
                      return (
                        <div key={idx} className="flex flex-col md:flex-row md:items-center md:gap-2 bg-gray-50 rounded px-3 py-2 border border-gray-200">
                          <span className="text-xs font-semibold text-gray-600 md:w-32">{label.trim()}</span>
                          <span className="text-sm font-mono text-gray-900 break-all">{value || label.trim()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seller Name and Instructions */}
              {(ctx.sellerName || ctx.instructions) && (
                <div className="border rounded-lg p-4 space-y-2">
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
              )}
            </CardContent>
          </Card>

          {actionError && (
            <div className="flex flex-col gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <p>{actionError}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void refreshTrade()
                      .then(() => setActionError(""))
                      .catch((error) => setActionError(error.message))
                  }
                >
                  Refresh trade
                </Button>
                {canDispute && (
                  <Button
                    size="sm"
                    onClick={() => setShowDisputeModal(true)}
                  >
                    Open dispute
                  </Button>
                )}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {canConfirmPayment && (
              <Button
                size="lg"
                className="w-full text-lg font-bold h-14 bg-green-600 hover:bg-green-700"
                onClick={handleMarkPaid}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                I have paid
              </Button>
            )}

            {canInitiateRelease && (
              <Button
                size="lg"
                className="w-full text-lg font-bold h-14 bg-blue-600 hover:bg-blue-700"
                onClick={handleInitiateRelease}
                disabled={updating}
              >
                {updating ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-5 w-5 mr-2" />
                )}
                Request release code
              </Button>
            )}

            {status === "PAYMENT_CONFIRMED_BY_BUYER" && isBuyerSide && (
              <p className="text-center text-sm text-muted-foreground">
                Payment confirmed. Waiting for the seller to release the asset.
              </p>
            )}

            {status === "PENDING_PAYMENT" && isSellerSide && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for the buyer to confirm payment.
              </p>
            )}

            {canCancel && (
              <Button
                variant="destructive"
                className="w-full h-12"
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelling || updating}
              >
                <XCircle className="h-5 w-5 mr-2" /> Cancel Order
              </Button>
            )}

            {canOpenDispute && (
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={() => setShowDisputeModal(true)}
              >
                <AlertTriangle className="h-5 w-5 mr-2" /> Open dispute
              </Button>
            )}
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
          const res = await fetchOnce(
            `/api/fstack/p2p/${reference}/dispute`,
            {
              method: "POST",
              body: formData,
            },
          );
          const data = await res.json();
          if (res.ok && data.success !== false) {
            updateLocalStatus(data.data?.status || "DISPUTE_PENDING", {
              disputedAt: new Date().toISOString(),
            });
            toast({
              title: "Dispute Submitted",
              description: "Support will contact you soon.",
            });
            router.push("/dashboard/p2p");
          } else {
            throw new Error(
              data.message || data.error || "Failed to open dispute",
            );
          }
        }}
      />
    </div>
  );
}
