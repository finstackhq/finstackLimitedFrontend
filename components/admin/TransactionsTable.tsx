'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface Transaction {
  id: string;
  user: string;
  userEmail: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  reference: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };
  const formatCurrency = (amount: number, currency: string) => {
    const code = (currency || 'USD').toUpperCase();
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 2,
      }).format(Number.isFinite(amount) ? amount : Number(amount) || 0);
    } catch {
      const safeAmount = Number.isFinite(amount) ? amount.toFixed(2) : (Number(amount) || 0).toFixed(2);
      return `${safeAmount} ${code}`;
    }
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
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return 'bg-blue-100 text-blue-800';
      case 'withdrawal':
        return 'bg-orange-100 text-orange-800';
      case 'p2p transfer':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-8 text-center text-gray-500">
          <p className="text-lg font-medium mb-2">No transactions found</p>
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
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleTransactionClick(transaction)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.user}</p>
                    <p className="text-xs text-gray-500">{transaction.userEmail}</p>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </div>
                  <Badge className={getTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(transaction.date)}</span>
                  <span className="font-mono">{transaction.reference}</span>
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
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr 
                key={transaction.id} 
                className="hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleTransactionClick(transaction)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{transaction.user}</div>
                    <div className="text-sm text-gray-500">{transaction.userEmail}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getTypeColor(transaction.type)}>
                    {transaction.type}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    {formatDate(transaction.date)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 font-mono">
                    {transaction.reference}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transaction Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={closeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Transaction Details</DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeModal}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Overview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Transaction Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Transaction ID</label>
                    <p className="text-sm font-mono">{selectedTransaction.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Reference</label>
                    <p className="text-sm font-mono">{selectedTransaction.reference}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Type</label>
                    <Badge className={getTypeColor(selectedTransaction.type)}>
                      {selectedTransaction.type}
                    </Badge>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <Badge className={getStatusColor(selectedTransaction.status)}>
                      {selectedTransaction.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Amount & Currency */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Amount Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Amount</label>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(selectedTransaction.amount, selectedTransaction.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Currency</label>
                    <p className="text-sm">{selectedTransaction.currency}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">User Name</label>
                    <p className="text-sm">{selectedTransaction.user}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm">{selectedTransaction.userEmail}</p>
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-3">Timestamp</h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time</label>
                  <p className="text-sm">{formatDate(selectedTransaction.date)}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}