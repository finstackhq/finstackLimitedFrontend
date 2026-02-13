"use client";

import { useState, useEffect } from "react";
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
  ad: P2PAd;
  trader: Trader;
  open: boolean;
  onClose: () => void;
  onOrderCreated: (order: P2POrder) => void;
}

function getFiatSymbol(fiat: string) {
  if (fiat === "NGN") return "₦";
  if (fiat === "RMB" || fiat === "CNY") return "¥";
  if (fiat === "GHS") return "₵";
  if (fiat === "USD") return "$";
  return fiat;
}

export function OrderModal({
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
    console.log("[STEP2] handleConfirm called");
    console.log("[STEP2] ad.type:", ad.type);
    console.log("[STEP2] selectedPayment:", selectedPayment);

    // STEP2: Extra debug: log userPaymentMethods
    if (ad.type === "sell") {
      // Removed debug log for production
    }
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

    // Removed warning toast for production

    setIsLoading(true);
    setError(null);


      // STEP3: Robust paymentMethod extraction for SELL
      let paymentMethod = undefined;
      if (ad.type === "sell") {
        if (!selectedPayment) {
          toast({
            title: "Select Payment Method",
            description: "Please select your payment method to receive payment.",
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

      // STEP3: log paymentMethod before payload
      if (ad.type === "sell") {
        console.log("[STEP3] paymentMethod to send:", paymentMethod);
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
              paymentDetails: paymentDetails || (typeof selectedPayment === "object" ? { ...selectedPayment } : undefined),
            }
          : {}),
      };
      console.log("[STEP4] Payload to send:", payload);
      if (ad.type === "sell" && !payload.paymentMethod) {
        toast({
          title: "Payment Method Missing (Failsafe)",
          description: "Payload is missing paymentMethod. Please select a payment method and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const response = await fetchWithAuth("/api/fstack/p2p", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to create order");
      }

      // Always use backend's returned paymentDetails if present
      const initiatePayload = (
        data && typeof data === "object" ? data.data || data : null
      ) as any;
      const orderId =
        initiatePayload?._id ||
        initiatePayload?.tradeId ||
        initiatePayload?.id ||
        initiatePayload?.reference ||
        data.data?._id ||
        data.order?._id ||
        data._id;

      if (!orderId) {
        throw new Error("Order created but ID missing");
      }

      // Removed order created toast for production

      const fullName =
        typeof trader?.name === "string" ? trader.name.trim() : "";
      const [sellerFirstName, ...restName] = fullName
        ? fullName.split(/\s+/)
        : [""];
      const sellerLastName = restName.join(" ");

      // Patch: Always save full payment method for BUY and SELL
      let patchedPaymentDetails = initiatePayload?.paymentDetails;
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
      console.log("[DEBUG] selectedPayment:", selectedPayment);
    try {
      // ...existing code...
      // Build paymentDetails for SELL
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
          // Assume bank account object
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

      // Always include paymentMethod and paymentDetails in payload for SELL
      let paymentMethod = undefined;
      if (ad.type === "sell") {
        if (!selectedPayment) {
          toast({
            title: "Select Payment Method",
            description: "Please select your payment method to receive payment.",
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
      const payload = {
        adId: ad.id,
        amountSource: Number(fiatAmount),
        ...(ad.type === "sell"
          ? {
              paymentMethod,
              paymentDetails: paymentDetails || (typeof selectedPayment === "object" ? { ...selectedPayment } : undefined),
            }
          : {}),
      };
      console.log("[STEP4] Payload to send:", payload);
      if (ad.type === "sell" && !payload.paymentMethod) {
        toast({
          title: "Payment Method Missing (Failsafe)",
          description: "Payload is missing paymentMethod. Please select a payment method and try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const response = await fetchWithAuth("/api/fstack/p2p", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || data.message || "Failed to create order");
      }

      // ...existing code for tradeContext and navigation...
      // Removed debug log for production
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
          reference: initiatePayload?.reference,
          side: initiatePayload?.side,
          amountFiat: initiatePayload?.amountFiat,
          amountCrypto: initiatePayload?.amountCrypto,
          platformFeeCrypto: initiatePayload?.platformFeeCrypto,
          netCryptoAmount: initiatePayload?.netCryptoAmount,
          marketRate: initiatePayload?.marketRate,
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
      toast({
        title: "Trade Failed",
        description:
          error.message || "Failed to initiate trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {ad.type === "buy"
              ? `Buy ${ad.cryptoCurrency} with ${ad.fiatCurrency}`
              : `Sell ${ad.cryptoCurrency} for ${ad.fiatCurrency}`}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Price Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Price</span>
              <span className="font-bold text-lg">
                {/* Responsive font size: base=sm, md+=lg */}
                <span className="font-bold text-sm md:text-lg">
                  {ad.cryptoCurrency === "CNGN"
                    ? "₦"
                    : ad.cryptoCurrency === "USDC"
                      ? "$"
                      : ""}
                  {ad.price}/{ad.fiatCurrency}
                </span>
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
              <>
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
              </>
            ) : (
              // --- SELL FLOW: Sending Crypto, Receiving Fiat ---
              <>
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
              </>
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
                    {/* Debug: Show all payment methods in console */}
                    {console.log(
                      "[DEBUG] userPaymentMethods:",
                      userPaymentMethods,
                    )}
                    {userPaymentMethods.map((method) => {
                      const isAlipay = method.type === "ALIPAY";
                      return (
                        <button
                          key={isAlipay ? "ALIPAY" : String(method._id)}
                          type="button"
                          onClick={() => {
                            console.log("[STEP1] Payment method button clicked", method);
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
                      console.log("[STEP1] Payment method button clicked (BUY)", detail.type);
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
                      console.log("[STEP1] Payment method button clicked (BUY fallback)", method);
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
              Seller's Instructions:{" "}
              <span className="font-medium">{ad.instructions || "-"}</span>
            </span>
          </div>

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
                console.log("[STEP0] Confirm Order button clicked. selectedPayment:", selectedPayment);
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
