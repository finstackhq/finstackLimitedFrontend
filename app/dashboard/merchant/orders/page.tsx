"use client";

import { useState, useEffect } from "react";
import { MerchantOrderFlow } from "@/components/p2p/MerchantOrderFlow";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

// Mock orders for demonstration
type OrderStatus =
  | "pending_payment"
  | "awaiting_release"
  | "PAYMENT_CONFIRMED_BY_BUYER"
  | "completed"
  | "disputed";

interface Order {
  id: string;
  reference: string; // Order reference like P2P-1767112468832
  buyerName: string;
  cryptoAmount: number;
  fiatAmount: number;
  netCryptoAmount: number; // After platform fee
  platformFee: number;
  cryptoCurrency: string;
  fiatCurrency: string;
  paymentMethod: string;
  side: string; // BUY or SELL
  marketRate: number;
  status: OrderStatus;
  createdAt: Date;
  expiresAt: Date;
  paymentProof?: string;
}

export default function MerchantOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/fstack/orders");
        const json = await res.json();

        if (json.success && Array.isArray(json.trades)) {
          const mappedOrders: Order[] = json.trades.map((trade: any) => ({
            id: trade._id || trade.id,
            reference: trade.reference || trade._id || trade.id,
            buyerName: trade.userId?.slice(0, 8) + "..." || "Unknown",
            cryptoAmount: trade.amountCrypto || 0,
            fiatAmount: trade.amountFiat || 0,
            netCryptoAmount: trade.netCryptoAmount || 0,
            platformFee: trade.platformFeeCrypto || 0,
            cryptoCurrency: trade.currencyTarget || "CNGN",
            fiatCurrency: trade.currencySource || "XAF",
            paymentMethod: trade.provider || "Fin Stack",
            side: trade.side || "BUY",
            marketRate: trade.marketRate || trade.listingRate || 0,
            status: (trade.status || "pending_payment") as OrderStatus,
            createdAt: new Date(trade.createdAt || Date.now()),
            expiresAt: new Date(trade.expiresAt || Date.now() + 30 * 60 * 1000),
            paymentProof: trade.paymentProof,
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder && selectedOrder.side === "SELL") {
      console.log(
        "[DEBUG] Fetching trade details for reference:",
        selectedOrder.reference,
      );
      fetch(`/api/fstack/trade/${selectedOrder.reference}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("[DEBUG] Full API response:", data);
          if (data.success && data.data?.paymentDetails) {
            console.log(
              "[DEBUG] Merchant paymentDetails:",
              data.data.paymentDetails,
            );
            setPaymentDetails(data.data.paymentDetails);
          } else {
            console.warn("[DEBUG] No paymentDetails found in API response.");
            setPaymentDetails(null);
          }
        })
        .catch((err) => {
          console.error("[DEBUG] Error fetching trade details:", err);
          setPaymentDetails(null);
        });
    } else {
      setPaymentDetails(null);
    }
  }, [selectedOrder]);

  const handleComplete = () => {
    if (!selectedOrder) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, status: "completed" as OrderStatus }
          : o,
      ),
    );
    setSelectedOrder(null);
  };

  const handleDispute = async () => {
    if (!selectedOrder) return;
    // API call is now handled within MerchantOrderFlow (via DisputeModal)
    // We just need to update the local state to reflect the change
    setOrders((prev) =>
      prev.map((o) =>
        o.id === selectedOrder.id
          ? { ...o, status: "disputed" as OrderStatus }
          : o,
      ),
    );
    setSelectedOrder(null);
  };

  if (selectedOrder) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setSelectedOrder(null)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Button>
        {selectedOrder.side === "SELL" && (
          <Card className="p-6 mb-4">
            <h3 className="text-lg font-semibold mb-3">User Payment Details</h3>
            {/* Removed debug JSON display of paymentDetails */}
            {!paymentDetails && (
              <div className="text-sm text-red-500">
                No payment details found for this order. (Check console for
                debug info)
              </div>
            )}
            {paymentDetails && paymentDetails.type === "BANK" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bank Name</span>
                  <span className="font-medium">{paymentDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Number</span>
                  <span className="font-medium font-mono">
                    {paymentDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Name</span>
                  <span className="font-medium">
                    {paymentDetails.accountName}
                  </span>
                </div>
                {paymentDetails.bankCode && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bank Code</span>
                    <span className="font-medium">
                      {paymentDetails.bankCode}
                    </span>
                  </div>
                )}
                {paymentDetails.country && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Country</span>
                    <span className="font-medium">
                      {paymentDetails.country}
                    </span>
                  </div>
                )}
              </div>
            )}
            {paymentDetails && paymentDetails.type === "ALIPAY" && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex flex-col items-center bg-gray-50">
                  <div className="mb-2 font-semibold text-blue-700">
                    Alipay QR Code
                  </div>
                  {!paymentDetails.alipayQrImage && (
                    <div className="text-xs text-red-500">
                      No Alipay QR code image provided.
                    </div>
                  )}
                  {paymentDetails.alipayQrImage && (
                    <>
                      <img
                        src={paymentDetails.alipayQrImage}
                        alt="Alipay QR"
                        className="h-32 w-32 object-contain rounded border mb-2"
                      />
                      <button
                        className="inline-block px-3 py-1 bg-blue-600 text-white rounded text-xs mb-2"
                        onClick={async () => {
                          try {
                            const response = await fetch(paymentDetails.alipayQrImage);
                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'alipay-qr.png';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                          } catch (err) {
                            alert('Failed to download QR image.');
                          }
                        }}
                      >
                        Download QR
                      </button>
                    </>
                  )}
                  <div className="w-full flex flex-col gap-2 mt-2">
                    <div>
                      <span className="block text-xs text-gray-500">
                        Account Name
                      </span>
                      <input
                        className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                        value={paymentDetails.alipayAccountName || ""}
                        readOnly
                      />
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500">
                        Alipay Email
                      </span>
                      <input
                        className="w-full border rounded px-2 py-1 text-sm bg-gray-100"
                        value={paymentDetails.alipayEmail || ""}
                        readOnly
                      />
                    </div>
                  </div>
                  {paymentDetails.country && (
                    <div className="mt-2 text-xs text-gray-500">
                      Country:{" "}
                      <span className="font-medium text-gray-700">
                        {paymentDetails.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {paymentDetails &&
              paymentDetails.type !== "BANK" &&
              paymentDetails.type !== "ALIPAY" && (
                <div className="text-sm text-gray-500">
                  Unrecognized payment details type. Raw details:
                  <br />
                  <pre>{JSON.stringify(paymentDetails, null, 2)}</pre>
                </div>
              )}
          </Card>
        )}
        <MerchantOrderFlow
          order={selectedOrder}
          onComplete={handleComplete}
          onDispute={handleDispute}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/dashboard/merchant">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
            My Orders
          </h1>
          <p className="text-gray-600">Manage and fulfill your P2P orders</p>
        </div>
        <Card className="p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading orders...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/dashboard/merchant">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
          My Orders
        </h1>
        <p className="text-gray-600">Manage and fulfill your P2P orders</p>
      </div>

      <div className="space-y-4">
        {orders.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No active orders</p>
          </Card>
        ) : (
          orders.map((order) => (
            <Card
              key={order.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold mb-1">{order.reference}</h3>
                  <p className="text-xs text-gray-500">
                    Buyer: {order.buyerName}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge
                    className={
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "disputed"
                          ? "bg-red-100 text-red-800"
                          : order.status === "awaiting_release" ||
                              order.status === "PAYMENT_CONFIRMED_BY_BUYER"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                  <span className="text-xs text-gray-500">{order.side}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fiat Amount</p>
                  <p className="font-bold text-green-600">
                    {order.fiatAmount.toLocaleString()} {order.fiatCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Crypto Amount</p>
                  <p className="font-bold">
                    {order.cryptoAmount} {order.cryptoCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Net (After Fee)</p>
                  <p className="font-medium text-blue-600">
                    {order.netCryptoAmount} {order.cryptoCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Platform Fee</p>
                  <p className="font-medium text-orange-600">
                    {order.platformFee} {order.cryptoCurrency}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Rate</p>
                  <p className="text-sm font-medium">
                    {order.marketRate} {order.fiatCurrency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Provider</p>
                  <p className="text-sm font-medium">{order.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Created</p>
                  <p className="text-sm font-medium">
                    {order.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Expires</p>
                  <p className="text-sm font-medium">
                    {Math.max(
                      0,
                      Math.floor(
                        (order.expiresAt.getTime() - Date.now()) / 1000 / 60,
                      ),
                    )}{" "}
                    min
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button size="sm">View Details</Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
