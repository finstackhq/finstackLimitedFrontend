'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';

interface P2POrder {
  id: string;
  buyer: string;
  buyerEmail: string;
  seller: string;
  sellerEmail: string;
  amount: number;
  currency: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  rate: number;
  status: string;
  paymentMethod: string;
  date: string;
  reference: string;
  escrowReleased: boolean;
  disputeCount: number;
}

interface P2POrdersTableProps {
  orders: P2POrder[];
}

export function P2POrdersTable({ orders }: P2POrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<P2POrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOrderClick = (order: P2POrder) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'disputed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'disputed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-8 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No P2P orders found</p>
          <p className="text-sm">Try adjusting your search or filter criteria.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Mobile View */}
      <div className="block md:hidden">
        <div className="divide-y divide-gray-200">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleOrderClick(order)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.buyer} → {order.seller}</p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount, order.currency)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Crypto</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {order.cryptoAmount} {order.cryptoCurrency}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(order.date)}</span>
                  <span>{order.paymentMethod}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment Method
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr 
                key={order.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleOrderClick(order)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  <div className="text-xs text-gray-500">{order.reference}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="text-gray-600">Buyer:</span> <span className="font-medium">{order.buyer}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Seller:</span> <span className="font-medium">{order.seller}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.amount, order.currency)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.cryptoAmount} {order.cryptoCurrency}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    ₦{order.rate.toLocaleString()} / {order.cryptoCurrency}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{order.paymentMethod}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </Badge>
                  {order.disputeCount > 0 && (
                    <div className="text-xs text-red-600 mt-1">
                      {order.disputeCount} dispute(s)
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(order.date)}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>P2P Order Details</DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Order Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Order ID</label>
                    <p className="text-sm font-mono">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reference</label>
                    <p className="text-sm font-mono">{selectedOrder.reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedOrder.status)}
                        {selectedOrder.status}
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-blue-900">Buyer Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-blue-700">Name</label>
                      <p className="text-sm">{selectedOrder.buyer}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-blue-700">Email</label>
                      <p className="text-sm">{selectedOrder.buyerEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-3 text-green-900">Seller Information</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-green-700">Name</label>
                      <p className="text-sm">{selectedOrder.seller}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-green-700">Email</label>
                      <p className="text-sm">{selectedOrder.sellerEmail}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Transaction Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fiat Amount</label>
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(selectedOrder.amount, selectedOrder.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Crypto Amount</label>
                    <p className="text-lg font-bold text-gray-900">
                      {selectedOrder.cryptoAmount} {selectedOrder.cryptoCurrency}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Exchange Rate</label>
                    <p className="text-sm">₦{selectedOrder.rate.toLocaleString()} per {selectedOrder.cryptoCurrency}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                    <p className="text-sm">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
              </div>

              {/* Security & Compliance */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Security & Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Escrow Status</label>
                    <p className={`text-sm font-medium ${selectedOrder.escrowReleased ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedOrder.escrowReleased ? 'Released' : 'Held'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Disputes</label>
                    <p className={`text-sm font-medium ${selectedOrder.disputeCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {selectedOrder.disputeCount} dispute(s)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date Created</label>
                    <p className="text-sm">{formatDate(selectedOrder.date)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <Button variant="outline" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  View User Profiles
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Investigate Order
                </Button>
                {selectedOrder.disputeCount > 0 && (
                  <Button variant="destructive" className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Resolve Dispute
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}