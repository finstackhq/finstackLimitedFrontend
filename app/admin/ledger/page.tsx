'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  date: string;
  type: 'credit' | 'debit';
  category: string;
  description: string;
  amount: number;
  currency: string;
  balance: number;
  reference: string;
  userId?: string;
  userName?: string;
}

export default function TransactionLedgerPage() {
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    currency: 'all',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Mock data - replace with API call
  useEffect(() => {
    const mockEntries: LedgerEntry[] = [
      {
        id: '1',
        date: '2025-01-15T10:30:00',
        type: 'credit',
        category: 'User Deposit',
        description: 'NGN deposit from user',
        amount: 50000,
        currency: 'NGN',
        balance: 2750000,
        reference: 'TXN-1234567890',
        userId: 'user-123',
        userName: 'John Doe'
      },
      {
        id: '2',
        date: '2025-01-15T09:15:00',
        type: 'debit',
        category: 'User Withdrawal',
        description: 'USDT withdrawal to user',
        amount: 100,
        currency: 'USDT',
        balance: 8900,
        reference: 'TXN-0987654321',
        userId: 'user-456',
        userName: 'Jane Smith'
      },
      {
        id: '3',
        date: '2025-01-14T16:45:00',
        type: 'credit',
        category: 'P2P Commission',
        description: 'Commission from P2P trade',
        amount: 250,
        currency: 'NGN',
        balance: 2700000,
        reference: 'TXN-1122334455',
      },
      {
        id: '4',
        date: '2025-01-14T14:20:00',
        type: 'debit',
        category: 'Platform Fee',
        description: 'Processing fee refund',
        amount: 5,
        currency: 'USDT',
        balance: 8800,
        reference: 'TXN-5544332211',
      },
    ];

    setTimeout(() => {
      setEntries(mockEntries);
      setFilteredEntries(mockEntries);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = entries;

    if (filters.search) {
      filtered = filtered.filter(entry =>
        entry.reference.toLowerCase().includes(filters.search.toLowerCase()) ||
        entry.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        entry.userName?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(entry => entry.type === filters.type);
    }

    if (filters.currency !== 'all') {
      filtered = filtered.filter(entry => entry.currency === filters.currency);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(entry => new Date(entry.date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(entry => new Date(entry.date) <= new Date(filters.dateTo));
    }

    setFilteredEntries(filtered);
    setCurrentPage(1);
  }, [entries, filters]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + itemsPerPage);

  const totalCredits = entries.filter(e => e.type === 'credit').reduce((sum, e) => sum + e.amount, 0);
  const totalDebits = entries.filter(e => e.type === 'debit').reduce((sum, e) => sum + e.amount, 0);
  const netBalance = totalCredits - totalDebits;

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Currency', 'Balance', 'Reference', 'User'],
      ...filteredEntries.map(entry => [
        new Date(entry.date).toLocaleString(),
        entry.type,
        entry.category,
        entry.description,
        entry.amount,
        entry.currency,
        entry.balance,
        entry.reference,
        entry.userName || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Transaction Ledger</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Transaction Ledger</h1>
        <div className="text-xs md:text-sm text-gray-600">
          {filteredEntries.length} of {entries.length} entries
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Credits</p>
              <p className="text-lg md:text-xl font-semibold text-green-600">
                ₦{totalCredits.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Total Debits</p>
              <p className="text-lg md:text-xl font-semibold text-red-600">
                ₦{totalDebits.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 md:p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-blue-600"></div>
            </div>
            <div>
              <p className="text-xs md:text-sm text-gray-600">Net Balance</p>
              <p className={cn(
                "text-lg md:text-xl font-semibold",
                netBalance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                ₦{netBalance.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by reference, description, or user..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
            >
              <option value="all">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>

            <select
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
              className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm"
            >
              <option value="all">All Currencies</option>
              <option value="NGN">NGN</option>
              <option value="USDT">USDT</option>
            </select>

            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="text-sm"
            />

            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="text-sm"
            />

            <Button
              onClick={exportToCSV}
              variant="outline"
              className="text-xs md:text-sm"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              Export
            </Button>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Category</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Description</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Balance</th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Reference</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-2 text-sm">
                    {new Date(entry.date).toLocaleDateString()}
                    <br />
                    <span className="text-xs text-gray-400">
                      {new Date(entry.date).toLocaleTimeString()}
                    </span>
                  </td>
                  <td className="py-4 px-2">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      entry.type === 'credit' 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    )}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-sm text-gray-600">{entry.category}</td>
                  <td className="py-4 px-2 text-sm text-gray-900">
                    {entry.description}
                    {entry.userName && (
                      <div className="text-xs text-gray-500">User: {entry.userName}</div>
                    )}
                  </td>
                  <td className="py-4 px-2">
                    <span className={cn(
                      "font-semibold",
                      entry.type === 'credit' ? "text-green-600" : "text-red-600"
                    )}>
                      {entry.type === 'credit' ? '+' : '-'}
                      {entry.currency === 'NGN' ? '₦' : '$'}
                      {entry.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-4 px-2 text-sm font-medium">
                    {entry.currency === 'NGN' ? '₦' : '$'}
                    {entry.balance.toLocaleString()}
                  </td>
                  <td className="py-4 px-2 text-xs font-mono text-gray-600">
                    {entry.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {paginatedEntries.map((entry) => (
            <div key={entry.id} className="p-3 border border-gray-200 rounded-lg bg-white">
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  entry.type === 'credit' 
                    ? "bg-green-100 text-green-800" 
                    : "bg-red-100 text-red-800"
                )}>
                  {entry.type}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{entry.category}</span>
                  <span className={cn(
                    "font-semibold text-sm",
                    entry.type === 'credit' ? "text-green-600" : "text-red-600"
                  )}>
                    {entry.type === 'credit' ? '+' : '-'}
                    {entry.currency === 'NGN' ? '₦' : '$'}
                    {entry.amount.toLocaleString()}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600">{entry.description}</p>
                
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Balance</p>
                    <p className="text-sm font-medium">
                      {entry.currency === 'NGN' ? '₦' : '$'}
                      {entry.balance.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Reference</p>
                    <p className="text-xs font-mono text-gray-600 break-all">
                      {entry.reference}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center md:text-left">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredEntries.length)} of{" "}
              {filteredEntries.length} entries
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    size="sm"
                    variant={currentPage === page ? "default" : "outline"}
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-blue-600 text-white" : ""}
                  >
                    {page}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}