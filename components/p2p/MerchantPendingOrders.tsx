'use client';

import { useState, useEffect } from 'react';
import { P2POrder, PaymentMethod } from '@/lib/p2p-mock-data';
import { getOrdersByMerchantId, updateOrder } from '@/lib/p2p-storage';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface MerchantPendingOrdersProps {
  merchantId: string;
}

export function MerchantPendingOrders({ merchantId }: MerchantPendingOrdersProps) {
  const [orders, setOrders] = useState<P2POrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPendingOrders();
    // Set up interval to refresh orders
    const interval = setInterval(loadPendingOrders, 5000);
    return () => clearInterval(interval);
  }, [merchantId]);

  const loadPendingOrders = () => {
    const merchantOrders = getOrdersByMerchantId(merchantId);
    // Filter for pending payment orders
    const pending = merchantOrders.filter(o => o.status === 'pending_payment');
    setOrders(pending);
  };

  const handleViewDetails = (order: P2POrder) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleAcceptOrder = (order: P2POrder) => {
    setSelectedOrder(order);
    setShowAcceptModal(true);
  };

  const handleRejectOrder = (order: P2POrder) => {
    setSelectedOrder(order);
    setShowRejectModal(true);
  };

  const confirmAccept = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 800));

    updateOrder(selectedOrder.id, {
      status: 'awaiting_release'
    });

    toast({
      title: 'Order Accepted',
      description: 'Waiting for buyer to confirm payment. Transfer the crypto to complete the order.'
    });

    setShowAcceptModal(false);
    loadPendingOrders();
    setIsProcessing(false);
  };

  const confirmReject = async () => {
    if (!selectedOrder) return;
    
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    updateOrder(selectedOrder.id, {
      status: 'cancelled',
      cancelledAt: new Date()
    });

    toast({
      title: 'Order Rejected',
      description: 'The order has been cancelled.'
    });

    setShowRejectModal(false);
    setRejectReason('');
    loadPendingOrders();
    setIsProcessing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Awaiting Payment</Badge>;
      case 'awaiting_release':
      case 'PAYMENT_CONFIRMED_BY_BUYER':
        return <Badge className="bg-blue-100 text-blue-800"><AlertCircle className="w-3 h-3 mr-1" />Payment Received</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (orders.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No pending orders at this time</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {orders.map(order => (
          <Card key={order.id} className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusBadge(order.status)}
                  <span className="font-semibold">
                    {order.cryptoAmount} {order.cryptoCurrency}
                  </span>
                  <span className="text-gray-600">
                    for {order.fiatAmount.toLocaleString()} {order.fiatCurrency}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                  <div>
                    <p className="text-gray-600">Price</p>
                    <p className="font-medium">{order.price.toLocaleString()} {order.fiatCurrency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expires In</p>
                    <p className="font-medium">
                      {Math.max(0, Math.floor((order.expiresAt.getTime() - Date.now()) / 60000))} mins
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-medium text-xs">{order.id.substring(0, 12)}...</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewDetails(order)}
                >
                  Details
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAcceptOrder(order)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRejectOrder(order)}
                >
                  Reject
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium text-xs">{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crypto Amount</span>
                  <span className="font-medium">{selectedOrder.cryptoAmount} {selectedOrder.cryptoCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fiat Amount</span>
                  <span className="font-medium">{selectedOrder.fiatAmount.toLocaleString()} {selectedOrder.fiatCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium">{selectedOrder.price.toLocaleString()} {selectedOrder.fiatCurrency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium">{selectedOrder.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created At</span>
                  <span className="font-medium text-sm">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Expires At</span>
                  <span className="font-medium text-sm">{new Date(selectedOrder.expiresAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetailsModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Accept Order Modal */}
      {selectedOrder && (
        <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Accept Order</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">Order Summary</p>
                <p className="text-sm text-blue-800">
                  You will receive <span className="font-bold">{selectedOrder.fiatAmount.toLocaleString()} {selectedOrder.fiatCurrency}</span> via <span className="font-bold">{selectedOrder.paymentMethod}</span>
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  And transfer <span className="font-bold">{selectedOrder.cryptoAmount} {selectedOrder.cryptoCurrency}</span> to the buyer
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900 font-medium mb-2">⚠️ Important</p>
                <p className="text-xs text-yellow-800">
                  Only accept this order if you have received the {selectedOrder.fiatAmount.toLocaleString()} {selectedOrder.fiatCurrency} payment. After accepting, you have 24 hours to transfer the crypto to the buyer's wallet.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={isProcessing}
                  onClick={confirmAccept}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Accept'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Order Modal */}
      {selectedOrder && (
        <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Order</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to reject this order? The buyer will be notified.
              </p>

              <div>
                <Label htmlFor="reason">Reason (optional)</Label>
                <textarea
                  id="reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="E.g., Payment not received, bank transfer failed, etc."
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  disabled={isProcessing}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={isProcessing}
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  disabled={isProcessing}
                  onClick={confirmReject}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Reject Order'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
