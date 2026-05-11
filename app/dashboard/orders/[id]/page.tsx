"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { CustomerOrderFlow } from "@/components/p2p/CustomerOrderFlow";
import { TradeCancelScreen } from "@/components/p2p/TradeCancelScreen";
import { TradeDisputeScreen } from "@/components/p2p/TradeDisputeScreen";
import { TradeCompletionScreen } from "@/components/p2p/TradeCompletionScreen";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import React from "react";

export default function OrderDetailsPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = React.use(paramsPromise);
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/fstack/my-orders/${params.id}`);
      const json = await res.json();

      if (json.success && json.data) {
        const t = json.data;

        // Map API response to Component Props
        const mappedOrder = {
          ...t,
          id: t._id,
          reference: t.reference || t._id,

          sellerName: t.merchantId?.username || t.merchantName || "Merchant",
          buyerName: t.userId?.username || "Me",

          cryptoAmount: t.amountCrypto,
          fiatAmount: t.amountFiat,
          cryptoCurrency: t.currencyTarget,
          fiatCurrency: t.currencySource,
          paymentMethod: t.provider || "Bank Transfer",
          status: t.status,
          createdAt: new Date(t.createdAt),
          expiresAt: new Date(
            t.expiresAt || new Date(t.createdAt).getTime() + 30 * 60000,
          ),

          // Payment Details
          bankName: t.paymentDetails?.bankName,
          bankAccountNumber: t.paymentDetails?.accountNumber,
          bankAccountName: t.paymentDetails?.accountName,
          alipayAccountName: t.paymentDetails?.alipayAccountName,
          alipayEmail: t.paymentDetails?.alipayEmail,
          alipayQrImage: t.paymentDetails?.alipayQrImage,
          customAccountDetails: t.paymentDetails?.customAccountDetails,

          side: t.side,
          // Trade Completion details
          price: t.rate,
          completedAt: t.updatedAt,
          // Cancel/Dispute details
          cancelledAt: t.updatedAt,
          cancelledBy: t.cancelledBy,
          cancelReason: t.cancelReason,
          disputedAt: t.updatedAt,
        };
        setOrder(mappedOrder);
      } else {
        setError("Order not found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handleMarkPaid = async (proof?: string) => {
    try {
      // Matching PaymentPage logic
      const res = await fetch("/api/fstack/p2p/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: order.reference }),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Payment marked as sent" });
        fetchOrder(); // Refresh to update status
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to mark payment",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to mark payment",
        variant: "destructive",
      });
    }
  };

  const handleCancel = async () => {
    try {
      // Matching PaymentPage logic
      const res = await fetch(`/api/fstack/p2p/${order.reference}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();

      if (data.success) {
        toast({ title: "Success", description: "Order cancelled" });
        fetchOrder();
      } else {
        // Make error message more user-friendly
        let errorMsg = data.error || data.message || "Failed to cancel order";
        if (errorMsg.includes("seller") && errorMsg.includes("cannot cancel")) {
          errorMsg =
            "You cannot cancel the order while the trade is active. Please wait for completion or report an issue.";
        }
        toast({
          title: "Cannot Cancel",
          description: errorMsg,
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error)
    return <div className="p-12 text-center text-red-500">{error}</div>;
  if (!order) return null;

  // --- Render Logic based on Status ---

  if (order.status === "cancelled") {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <Link href="/dashboard/orders" className="mb-4 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </Link>
        <TradeCancelScreen
          tradeId={order._id}
          orderId={order.reference}
          cryptoCurrency={order.cryptoCurrency}
          fiatCurrency={order.fiatCurrency}
          cryptoAmount={order.cryptoAmount}
          fiatAmount={order.fiatAmount}
          cancelledAt={order.cancelledAt || new Date().toISOString()}
          cancelledBy={order.cancelledBy || "system"}
          cancelReason={order.cancelReason}
          wasPaymentMade={false} // API doesn't fully track this separately usually, assume no if cancelled unless dispute
        />
      </div>
    );
  }

  if (order.status === "disputed") {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <Link href="/dashboard/orders" className="mb-4 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </Link>
        <TradeDisputeScreen
          tradeId={order._id}
          reference={order.reference}
          paidAt={order.updatedAt || order.createdAt}
          cryptoCurrency={order.cryptoCurrency}
          fiatCurrency={order.fiatCurrency}
          cryptoAmount={order.cryptoAmount}
          fiatAmount={order.fiatAmount}
          onDisputeSubmitted={fetchOrder} // Refresh on new dispute
        />
      </div>
    );
  }

  if (order.status === "completed") {
    return (
      <div className="max-w-4xl mx-auto py-6">
        <Link href="/dashboard/orders" className="mb-4 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Button>
        </Link>
        <TradeCompletionScreen
          tradeId={order._id}
          reference={order.reference}
          side={order.side}
          cryptoCurrency={order.cryptoCurrency}
          fiatCurrency={order.fiatCurrency}
          cryptoAmount={order.cryptoAmount}
          fiatAmount={order.fiatAmount}
          price={order.price || 0}
          completedAt={order.completedAt || new Date().toISOString()}
          merchantId={order.merchantId || "Merchant"}
          merchantName={order.sellerName}
        />
      </div>
    );
  }

  // Default: Active Order Flow
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/orders">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Order Details</h1>
      </div>

      {/* Payment Details Section */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-4">
        <h2 className="text-lg font-semibold mb-4">Payment Details</h2>
        {/* Alipay Details Card */}
        {(order.alipayAccountName || order.alipayEmail || order.alipayQrImage) && (
          <div className="flex flex-col items-center gap-4 p-4 bg-white border rounded-lg shadow-sm mx-auto max-w-md">
            <div className="w-full flex flex-col gap-2">
              {order.alipayAccountName && (
                <div>
                  <span className="block text-xs text-gray-500">Alipay Name</span>
                  <span className="font-medium text-base">{order.alipayAccountName}</span>
                </div>
              )}
              {order.alipayEmail && (
                <div>
                  <span className="block text-xs text-gray-500">Alipay Email</span>
                  <span className="font-medium text-base">{order.alipayEmail}</span>
                </div>
              )}
            </div>
            {order.alipayQrImage && (
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 mb-1">Alipay QR Code</span>
                <img
                  src={order.alipayQrImage}
                  alt="Alipay QR"
                  className="w-64 h-64 object-contain border-2 rounded-lg shadow cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => setShowQrModal && setShowQrModal(true)}
                  style={{ background: '#fff' }}
                />
                <span className="text-xs text-gray-400">Click QR to enlarge</span>
                {/* Modal for enlarged QR */}
                {typeof showQrModal !== 'undefined' && showQrModal && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={() => setShowQrModal(false)}
                  >
                    <div
                      className="bg-white rounded-lg p-6 flex flex-col items-center relative"
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={order.alipayQrImage}
                        alt="Alipay QR Large"
                        className="w-96 h-96 object-contain rounded border mb-4"
                      />
                      <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                        onClick={() => setShowQrModal(false)}
                        aria-label="Close"
                      >
                        &times;
                      </button>
                      <div className="text-xs text-gray-500">Tap outside to close</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Other payment details (bank, custom, etc.) */}
        <ul className="space-y-1 text-sm mt-6">
          {order.bankName && (
            <li>
              <strong>Bank Name:</strong> {order.bankName}
            </li>
          )}
          {order.bankAccountNumber && (
            <li>
              <strong>Account Number:</strong> {order.bankAccountNumber}
            </li>
          )}
          {order.bankAccountName && (
            <li>
              <strong>Account Name:</strong> {order.bankAccountName}
            </li>
          )}
          {order.customAccountDetails && (
            <li>
              <strong>Custom Details:</strong> {order.customAccountDetails}
            </li>
          )}
          {!order.bankName &&
            !order.bankAccountNumber &&
            !order.bankAccountName &&
            !order.customAccountDetails &&
            !(order.alipayAccountName || order.alipayEmail || order.alipayQrImage) && (
              <li className="text-gray-500">No payment details available.</li>
            )}
        </ul>
      </div>

      <CustomerOrderFlow
        order={order}
        onMarkPaid={handleMarkPaid}
        onCancel={handleCancel}
        onRelease={fetchOrder} // Refresh after release
        onDispute={() => {
          fetchOrder(); // Just refresh the order state
        }}
      />
    </div>
  );
}
