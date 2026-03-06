"use client";

import React, { useState, useEffect } from "react";
import { usePaymentMethods } from "@/hooks/use-payment-methods";
import { fetchWithAuth } from "@/components/auth-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { P2PAd, Trader, P2POrder } from "@/lib/p2p-mock-data";

// Extend Trader interface if completedTrades doesn't exist
interface TraderWithStats extends Trader {
  completedTrades?: number;
  ratingPercentage?: number;
}

export { OrderModal };

// Extend P2PAd interface to include paymentDetails
interface P2PAdExtended extends P2PAd {
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    country?: string;
    type?: string;
  };
}
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeftRight,
  Clock,
  DollarSign,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderModalProps {
  ad: P2PAdExtended;
  trader: TraderWithStats;
  open: boolean;
  onClose: () => void;
  onOrderCreated: (order: P2POrder) => void;
}

function getFiatSymbol(fiat: string) {
  if (fiat === "NGN") return "₦";
  if (fiat === "GHS") return "₵";
  if (fiat === "USD") return "$";
}

function OrderModal({
  ad,
  trader,
  open,
  onClose,
  onOrderCreated,
}: OrderModalProps) {
  // Removed debug log for production
  const { toast } = useToast();
  const router = useRouter();
  const [fiatAmount, setFiatAmount] = useState("");
  const [cryptoAmount, setCryptoAmount] = useState("");
  // For SELL flow, selectedPayment is the user's payment method object
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  // Fetch user payment methods for SELL flow
  const {
    methods: userPaymentMethods,
    loading: loadingUserPayments,
    error: userPaymentsError,
  } = usePaymentMethods();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initiatePayload, setInitiatePayload] = useState<any>(null);

  // Only allow CNGN and USDC as crypto
  const supportedCryptos = ["CNGN", "USDC"];
  const isSupportedCrypto = supportedCryptos.includes(ad.cryptoCurrency);

  // Track which field was last edited
  const [lastEdited, setLastEdited] = useState<"fiat" | "crypto">("fiat");

  useEffect(() => {
    // USDC paired with fiat: use correct formulas
    if (ad.cryptoCurrency === "USDC" && ad.fiatCurrency !== "CNGN") {
      if (ad.type === "buy") {
        // BUY USDC with fiat: USDC = fiat / price
        if (lastEdited === "fiat") {
          if (fiatAmount && !isNaN(parseFloat(fiatAmount))) {
            const crypto = parseFloat(fiatAmount) / ad.price;
            setCryptoAmount(crypto ? crypto.toFixed(6) : "");
          } else {
            setCryptoAmount("");
          }
        } else {
          if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
            const fiat = parseFloat(cryptoAmount) * ad.price;
            setFiatAmount(fiat ? fiat.toFixed(2) : "");
          } else {
            setFiatAmount("");
          }
        }
      } else {
        // SELL USDC for fiat: fiat = USDC * price
        if (lastEdited === "crypto") {
          if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
            const fiat = parseFloat(cryptoAmount) * ad.price;
            setFiatAmount(fiat ? fiat.toFixed(2) : "");
          } else {
            setFiatAmount("");
          }
        } else {
          if (fiatAmount && !isNaN(parseFloat(fiatAmount))) {
            const crypto = parseFloat(fiatAmount) / ad.price;
            setCryptoAmount(crypto ? crypto.toFixed(6) : "");
          } else {
            setCryptoAmount("");
          }
        }
      }
    } else {
      // CNGN and all other pairs: keep original logic
      if (ad.type === "buy") {
        if (lastEdited === "fiat") {
          if (fiatAmount && !isNaN(parseFloat(fiatAmount))) {
            const crypto = parseFloat(fiatAmount) * ad.price;
            setCryptoAmount(crypto ? crypto.toFixed(6) : "");
          } else {
            setCryptoAmount("");
          }
        } else {
          if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
            const fiat = parseFloat(cryptoAmount) / ad.price;
            setFiatAmount(fiat ? fiat.toFixed(2) : "");
          } else {
            setFiatAmount("");
          }
        }
      } else {
        if (lastEdited === "crypto") {
          if (cryptoAmount && !isNaN(parseFloat(cryptoAmount))) {
            const fiat = parseFloat(cryptoAmount) / ad.price;
            setFiatAmount(fiat ? fiat.toFixed(2) : "");
          } else {
            setFiatAmount("");
          }
        } else {
          if (fiatAmount && !isNaN(parseFloat(fiatAmount))) {
            const crypto = parseFloat(fiatAmount) * ad.price;
            setCryptoAmount(crypto ? crypto.toFixed(6) : "");
          } else {
            setCryptoAmount("");
          }
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cryptoAmount, fiatAmount, ad.price, ad.type, lastEdited]);

  // User enters crypto (buy or sell)
  const handleCryptoChange = (value: string) => {
    setCryptoAmount(value);
    setLastEdited("crypto");
  };

  // User enters fiat (buy or sell)
  const handleFiatChange = (value: string) => {
    setFiatAmount(value);
    setLastEdited("fiat");
  };

  const handleConfirm = async () => {
    // STEP2: Log selectedPayment and ad.type before proceeding

    // Only declare fiat and crypto once at the top of handleConfirm
    const fiat = parseFloat(fiatAmount);
    const crypto = parseFloat(cryptoAmount);

    if (!fiat || !crypto) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (fiat < ad.minLimit || fiat > ad.maxLimit) {
      toast({
        title: "Amount Out of Range",
        description: `Amount must be between ${ad.minLimit} and ${ad.maxLimit} ${ad.fiatCurrency}`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // STEP3: Robust paymentMethod extraction for SELL
      let paymentMethod = undefined;
      if (ad.type === "sell") {
        if (!selectedPayment) {
          toast({
            title: "Select Payment Method",
            description:
              "Please select your payment method to receive payment.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (typeof selectedPayment === "object") {
          if (selectedPayment.type === "ALIPAY") {
            paymentMethod = "ALIPAY";
          } else if (selectedPayment._id) {
            paymentMethod = selectedPayment._id;
          } else {
            toast({
              title: "Invalid Payment Method",
              description: "Selected payment method is missing an ID.",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
        } else if (typeof selectedPayment === "string") {
          paymentMethod = selectedPayment;
        } else {
          toast({
            title: "Invalid Payment Method",
            description: "Please select a valid payment method.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (!paymentMethod) {
          toast({
            title: "Payment Method Required",
            description: "Please select a valid payment method.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      // Always build paymentDetails for SELL
      let paymentDetails = undefined;
      if (ad.type === "sell" && selectedPayment) {
        if (selectedPayment.type === "ALIPAY") {
          paymentDetails = {
            alipayAccountName: selectedPayment.alipayAccountName,
            alipayEmail: selectedPayment.alipayEmail,
            alipayQrImage: selectedPayment.alipayQrImage,
            country: selectedPayment.country || "NG",
            type: "ALIPAY",
          };
        } else {
          paymentDetails = {
            bankName: selectedPayment.bankName,
            accountNumber: selectedPayment.accountNumber,
            accountName: selectedPayment.accountName,
            bankCode: selectedPayment.bankCode,
            country: selectedPayment.country || "NG",
            type: "BANK",
          };
        }
      }

      const payload = {
        adId: ad.id,
        amountSource: Number(fiatAmount),
        ...(ad.type === "sell"
          ? {
              paymentMethod,
              paymentDetails:
                paymentDetails ||
                (typeof selectedPayment === "object"
                  ? { ...selectedPayment }
                  : undefined),
            }
          : {}),
      };
      if (ad.type === "sell" && !payload.paymentMethod) {
        toast({
          title: "Payment Method Missing (Failsafe)",
          description:
            "Payload is missing paymentMethod. Please select a payment method and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      let response, data;
      try {
        response = await fetchWithAuth("/api/fstack/p2p", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
        data = await response.json();
      } catch (networkError) {
        toast({
          title: "Network Error",
          description:
            "Unable to reach server. Please check your connection and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data.success) {
        // Show specific error for liquidity or other backend issues
        let errorMsg = data.error || data.message || "Failed to create order";
        let toastTitle = "Order Failed";
        if (errorMsg.toLowerCase().includes("liquidity")) {
          toastTitle = "Insufficient Liquidity";
        } else if (errorMsg.toLowerCase().includes("network")) {
          toastTitle = "Network Error";
        } else if (errorMsg.toLowerCase().includes("internal server error")) {
          toastTitle = "Server Error";
        }
        toast({
          title: toastTitle,
          description: errorMsg,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Always use backend's returned paymentDetails if present
      const initiatePayloadData = (
        data && typeof data === "object" ? data.data || data : null
      ) as any;
      setInitiatePayload(initiatePayloadData);
      const orderId =
        initiatePayload?._id ||
        initiatePayload?.tradeId ||
        initiatePayload?.id ||
        initiatePayload?.reference ||
        data.data?._id ||
        data.order?._id ||
        data._id;

      if (!orderId) {
        toast({
          title: "Order Created, But No ID",
          description:
            "Order was created but no order ID was returned. Please contact support.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Show success toast when order is created
      toast({
        title: "Order Created",
        description: `Your order has been created successfully! Order ID: ${orderId}`,
        variant: "default",
      });

      const fullName =
        typeof trader?.name === "string" ? trader.name.trim() : "";
      const [sellerFirstName, ...restName] = fullName
        ? fullName.split(/\s+/)
        : [""];
      const sellerLastName = restName.join(" ");

      // Patch: Always save full payment method for BUY and SELL
      let patchedPaymentDetails = initiatePayloadData?.paymentDetails;
      if (ad.type === "sell") {
        // SELL: use selectedPayment (user's own method)
        if (
          selectedPayment &&
          selectedPayment.type === "ALIPAY" &&
          patchedPaymentDetails &&
          Object.keys(patchedPaymentDetails).length <= 2
        ) {
          patchedPaymentDetails = {
            ...patchedPaymentDetails,
            alipayQrImage: selectedPayment.alipayQrImage,
            alipayAccountName: selectedPayment.alipayAccountName,
            alipayEmail: selectedPayment.alipayEmail,
          };
        }
      } else {
        // BUY: use merchant's payment method from ad.paymentMethodDetails or ad.paymentMethods
        let merchantAlipay = null;
        if (Array.isArray(ad.paymentMethodDetails)) {
          merchantAlipay = ad.paymentMethodDetails.find(
            (m) => m.type === "ALIPAY",
          );
        }
        if (merchantAlipay) {
          patchedPaymentDetails = {
            ...patchedPaymentDetails,
            ...merchantAlipay,
          };
        }
      }

      // Debug: Log selectedPayment and patchedPaymentDetails

      // ...existing code for tradeContext and navigation...
      const tradeContext = {
        tradeId: orderId,
        createdAt: new Date().toISOString(),
        sellerFirstName: sellerFirstName || undefined,
        sellerLastName: sellerLastName || undefined,
        sellerName: fullName || undefined,
        instructions: ad.instructions || undefined,
        paymentMethods: ad.paymentMethods,
        paymentWindow: ad.paymentWindow,
        ad: {
          id: ad.id,
          type: ad.type,
          cryptoCurrency: ad.cryptoCurrency,
          fiatCurrency: ad.fiatCurrency,
          price: ad.price,
          minLimit: ad.minLimit,
          maxLimit: ad.maxLimit,
          available: ad.available,
          country: ad.country,
        },
        initiate: {
          reference: initiatePayloadData?.reference,
          side: initiatePayloadData?.side,
          amountFiat: initiatePayloadData?.amountFiat,
          amountCrypto: initiatePayloadData?.amountCrypto,
          platformFeeCrypto: initiatePayloadData?.platformFeeCrypto,
          netCryptoAmount: initiatePayloadData?.netCryptoAmount,
          marketRate: initiatePayloadData?.marketRate,
          paymentDetails: paymentDetails,
        },
      };

      localStorage.setItem(
        `p2p_trade_${orderId}`,
        JSON.stringify(tradeContext),
      );

      router.push(`/dashboard/p2p/trade/${orderId}`);
      onClose();
    } catch (error: any) {
      setError(error.message || "Failed to initiate trade. Please try again.");
      let toastTitle = "Trade Failed";
      let errorMsg =
        error.message || "Failed to initiate trade. Please try again.";
      if (errorMsg.toLowerCase().includes("liquidity")) {
        toastTitle = "Insufficient Liquidity";
      } else if (errorMsg.toLowerCase().includes("network")) {
        toastTitle = "Network Error";
      } else if (errorMsg.toLowerCase().includes("internal server error")) {
        toastTitle = "Server Error";
      }
      toast({
        title: toastTitle,
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="order-modal-description">
        <DialogHeader>
          <DialogTitle>
            {ad.type === "buy" ? "Buy" : "Sell"} {ad.cryptoCurrency}
          </DialogTitle>
        </DialogHeader>

        {/* Accessibility description for DialogContent */}
        <div id="order-modal-description" className="sr-only">
          Complete your P2P order by entering the amount, selecting a payment method, and confirming the transaction. Platform fee and seller instructions are shown below.
        </div>

        <div className="space-y-4">
          {/* Trader Info */}
          <div className="flex items-center gap-3 pb-4 border-b">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
              {trader.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{trader.name}</p>
              <p className="text-xs text-gray-500">
                {trader.completedTrades ?? 0} trades •{" "}
                {trader.ratingPercentage ?? 0}%
              </p>
            </div>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>

          {/* Price and Limits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Price</span>
              <span>
                1 {ad.cryptoCurrency} = {getFiatSymbol(ad.fiatCurrency)}
                {ad.price}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Available</span>
              <span>
                {ad.available} {ad.cryptoCurrency}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Limits</span>
              <span>
                {ad.minLimit} - {ad.maxLimit} {ad.fiatCurrency}
              </span>
            </div>
            <div className="flex items-center text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3 mr-1" />
              Payment window: 30 minutes
            </div>
          </div>

          {/* Amount Inputs */}
          {isSupportedCrypto ? (
            ad.type === "buy" ? (
              // --- BUY FLOW: Receiving Crypto, Sending Fiat ---
              <React.Fragment>
                <div>
                  <Label htmlFor="crypto-amount">
                    You Receive ({ad.cryptoCurrency})
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                      {ad.cryptoCurrency === "CNGN"
                        ? "₦"
                        : ad.cryptoCurrency === "USDC"
                          ? "$"
                          : ad.cryptoCurrency}
                    </span>
                    <Input
                      id="crypto-amount"
                      type="number"
                      value={cryptoAmount}
                      onChange={(e) => handleCryptoChange(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fiat-amount">
                    You Send ({ad.fiatCurrency})
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                      {getFiatSymbol(ad.fiatCurrency)}
                    </span>
                    <Input
                      id="fiat-amount"
                      type="number"
                      value={fiatAmount}
                      onChange={(e) => handleFiatChange(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </React.Fragment>
            ) : (
              // --- SELL FLOW: Sending Crypto, Receiving Fiat ---
              <React.Fragment>
                <div>
                  <Label htmlFor="crypto-amount">
                    You Send ({ad.cryptoCurrency})
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                      {ad.cryptoCurrency === "CNGN"
                        ? "₦"
                        : ad.cryptoCurrency === "USDC"
                          ? "$"
                          : ad.cryptoCurrency}
                    </span>
                    <Input
                      id="crypto-amount"
                      type="number"
                      value={cryptoAmount}
                      onChange={(e) => handleCryptoChange(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="fiat-amount">
                    You Receive ({ad.fiatCurrency})
                  </Label>
                  <div className="relative mt-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 flex items-center justify-center">
                      {getFiatSymbol(ad.fiatCurrency)}
                    </span>
                    <Input
                      id="fiat-amount"
                      type="number"
                      value={fiatAmount}
                      onChange={(e) => handleFiatChange(e.target.value)}
                      placeholder="0.00"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </React.Fragment>
            )
          ) : (
            <div className="text-red-500 font-semibold text-center p-4">
              Unsupported crypto. Only CNGN and USDC are supported.
            </div>
          )}

          {/* Payment Method */}
          <div>
            <Label>Select Payment Method</Label>
            <div className="grid grid-cols-1 gap-2 mt-2 max-h-[160px] overflow-y-auto pr-1">
              {ad.type === "sell" ? (
                loadingUserPayments ? (
                  <div className="text-sm text-gray-500">
                    Loading payment methods...
                  </div>
                ) : userPaymentsError ? (
                  <div className="text-sm text-red-500">
                    {userPaymentsError}
                  </div>
                ) : userPaymentMethods.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No payment methods found. Please add one in your profile.
                  </div>
                ) : (
                  <>
                    {userPaymentMethods.map((method) => {
                      const isAlipay = method.type === "ALIPAY";
                      return (
                        <button
                          key={isAlipay ? "ALIPAY" : String(method._id)}
                          type="button"
                          onClick={() => {
                            // console.log("[STEP1] Payment method button clicked", method);
                            setSelectedPayment(method);
                          }}
                          disabled={isLoading}
                          className={`flex flex-col items-start p-3 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                            (selectedPayment &&
                              selectedPayment._id === method._id) ||
                            (isAlipay &&
                              selectedPayment &&
                              selectedPayment.type === "ALIPAY")
                              ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                              : "bg-white hover:bg-gray-50 border-gray-200"
                          }`}
                        >
                          <span className="font-semibold">
                            {isAlipay ? "Alipay" : `Bank: ${method.bankName}`}
                          </span>
                          {method.accountName && (
                            <span className="text-xs opacity-90">
                              Acct Name: {method.accountName}
                            </span>
                          )}
                          {method.accountNumber && (
                            <span className="text-xs opacity-90">
                              Acct #: {method.accountNumber}
                            </span>
                          )}
                          {method.alipayAccountName && (
                            <span className="text-xs opacity-90">
                              Alipay Name: {method.alipayAccountName}
                            </span>
                          )}
                          {method.alipayEmail && (
                            <span className="text-xs opacity-90">
                              Alipay Email: {method.alipayEmail}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </>
                )
              ) : // BUY flow: show ad's payment methods
              ad.paymentMethodDetails && ad.paymentMethodDetails.length > 0 ? (
                ad.paymentMethodDetails.map((detail, index) => (
                  <button
                    key={`${detail.type}-${index}`}
                    type="button"
                    onClick={() => {
                      // console.log("[STEP1] Payment method button clicked (BUY)", detail.type);
                      setSelectedPayment(detail.type);
                    }}
                    disabled={isLoading}
                    className={`flex flex-col items-start p-3 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedPayment === detail.type
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="font-semibold">
                      {detail.bankName || detail.type}
                    </span>
                    {detail.accountName && (
                      <span className="text-xs opacity-90">
                        {detail.accountName}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                ad.paymentMethods.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      // console.log("[STEP1] Payment method button clicked (BUY fallback)", method);
                      setSelectedPayment(method);
                    }}
                    disabled={isLoading}
                    className={`flex flex-col items-start p-3 rounded-lg border text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      selectedPayment === method
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="font-semibold">
                      {method.split(" - ")[0]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Platform Fee Notice */}
          <div className="flex items-center text-xs text-blue-700 bg-blue-50 rounded-md p-2 mt-2">
            <Info className="w-4 h-4 mr-2" />A 0.5% platform fee applies to this
            transaction.
          </div>

          {/* Seller's Instructions */}
          <div className="flex items-center text-xs bg-yellow-50 rounded-md p-2 mt-2 border border-yellow-200">
            <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
            <span>
              Seller's Instructions: {" "}
              <span className="font-medium">{ad.instructions || "-"}</span>
            </span>
          </div>

          {/* Merchant Payment Details (BUY/SELL flow) */}
          {(ad.paymentDetails || initiatePayload?.paymentDetails) && (
            <div className="merchant-payment-details mt-4 p-3 border rounded-lg bg-gray-50">
              <h3 className="font-semibold mb-2 text-sm text-gray-700">Merchant Payment Details</h3>
              <ul className="space-y-1 text-xs text-gray-800">
                {(ad.paymentDetails?.bankName || initiatePayload?.paymentDetails?.bankName) && (
                  <li><strong>Bank Name:</strong> {ad.paymentDetails?.bankName || initiatePayload?.paymentDetails?.bankName}</li>
                )}
                {(ad.paymentDetails?.accountNumber || initiatePayload?.paymentDetails?.accountNumber) && (
                  <li><strong>Account Number:</strong> {ad.paymentDetails?.accountNumber || initiatePayload?.paymentDetails?.accountNumber}</li>
                )}
                {(ad.paymentDetails?.accountName || initiatePayload?.paymentDetails?.accountName) && (
                  <li><strong>Account Name:</strong> {ad.paymentDetails?.accountName || initiatePayload?.paymentDetails?.accountName}</li>
                )}
                {(ad.paymentDetails?.country || initiatePayload?.paymentDetails?.country) && (
                  <li><strong>Country:</strong> {ad.paymentDetails?.country || initiatePayload?.paymentDetails?.country}</li>
                )}
                {(ad.paymentDetails?.type || initiatePayload?.paymentDetails?.type) && (
                  <li><strong>Type:</strong> {ad.paymentDetails?.type || initiatePayload?.paymentDetails?.type}</li>
                )}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-2 mt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // console.log("[STEP0] Confirm Order button clicked. selectedPayment:", selectedPayment);
                toast({
                  title: "Confirm Order Clicked",
                  description: `selectedPayment: ${JSON.stringify(selectedPayment)}`,
                  variant: "default",
                });
                handleConfirm();
              }}
              disabled={isLoading}
              className="flex-1 bg-blue-600 text-white"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm Order"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
