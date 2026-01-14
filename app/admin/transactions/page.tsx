'use client';

import { useEffect, useState } from 'react';
import { TransactionsTable } from '@/components/admin/TransactionsTable';
import { TransactionsFilter } from '@/components/admin/TransactionsFilter';
import { SetFeesModal } from '@/components/admin/SetFeesModal';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFeesModal, setShowFeesModal] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: 'all',
    currency: 'all',
    status: 'all'
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/admin/transactions');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
          setFilteredTransactions(data);
        }
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  useEffect(() => {
    let filtered = transactions;

    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter(txn => txn.type === filters.type);
    }

    if (filters.currency && filters.currency !== 'all') {
      filtered = filtered.filter(txn => txn.currency === filters.currency);
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(txn => txn.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(txn => 
        new Date(txn.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(txn => 
        new Date(txn.date) <= new Date(filters.dateTo)
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'User', 'Email', 'Type', 'Amount', 'Currency', 'Status', 'Date', 'Reference'],
      ...filteredTransactions.map(txn => [
        txn.id,
        txn.user,
        txn.userEmail,
        txn.type,
        txn.amount.toString(),
        txn.currency,
        txn.status,
        new Date(txn.date).toISOString(),
        txn.reference
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Transactions</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Transactions</h1>
          <div className="text-xs md:text-sm text-gray-600 mt-1">
            {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>
        <Button
          onClick={() => setShowFeesModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Set Fees
        </Button>
      </div>

      {/* Admin transaction summary (top) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{transactions.length}</p>
          <p className="text-xs text-gray-400 mt-1">All time</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Total Volume (NGN)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{
            transactions
              .filter(t => t.currency === 'NGN')
              .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0), 0)
              .toLocaleString()
          }</p>
          <p className="text-xs text-gray-400 mt-1">NGN equivalent across transactions</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">P2P Revenue (NGN)</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{
            // Calculate 1% commission on completed P2P trades in NGN
            (transactions
              .filter(t => t.type === 'P2P Trade' && t.status === 'Completed' && t.currency === 'NGN')
              .reduce((sum, t) => sum + (typeof t.amount === 'number' ? t.amount : Number(t.amount) || 0), 0) * 0.01
            ).toLocaleString()
          }</p>
          <p className="text-xs text-gray-400 mt-1">1% commission on completed P2P trades (NGN)</p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{
            transactions.length > 0
              ? Math.round((transactions.filter(t => t.status === 'Completed').length / transactions.length) * 100) + '%'
              : '—'
          }</p>
          <p className="text-xs text-gray-400 mt-1">{transactions.filter(t => t.status === 'Completed').length} completed</p>
        </div>
      </div>

      <TransactionsFilter 
        filters={filters} 
        onFiltersChange={setFilters}
        onExport={exportToCSV}
      />
      <TransactionsTable transactions={filteredTransactions} />
      
      <SetFeesModal 
        open={showFeesModal} 
        onOpenChange={setShowFeesModal} 
      />
    </div>
  );
}