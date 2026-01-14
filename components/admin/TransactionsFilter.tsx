'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

interface Filters {
  dateFrom: string;
  dateTo: string;
  type: string;
  currency: string;
  status: string;
}

interface TransactionsFilterProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onExport: () => void;
}

export function TransactionsFilter({ filters, onFiltersChange, onExport }: TransactionsFilterProps) {
  const handleFilterChange = (key: keyof Filters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex gap-4 flex-1">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="w-full sm:w-40">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Type
              </label>
              <Select value={filters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Deposit">Deposit</SelectItem>
                  <SelectItem value="Withdrawal">Withdrawal</SelectItem>
                  <SelectItem value="P2P Transfer">P2P Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-32">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Currency
              </label>
              <Select value={filters.currency} onValueChange={(value) => handleFilterChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-32">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="flex items-end">
          <Button onClick={onExport} variant="outline" className="w-full sm:w-auto">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>
    </div>
  );
}