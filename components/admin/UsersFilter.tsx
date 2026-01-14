'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface Filters {
  search: string;
  status: string;
  kycStatus: string;
}

interface UsersFilterProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function UsersFilter({ filters, onFiltersChange }: UsersFilterProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const handleKYCStatusChange = (value: string) => {
    onFiltersChange({ ...filters, kycStatus: value });
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users by name or email..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-full sm:w-48">
          <Select value={filters.kycStatus} onValueChange={handleKYCStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="All KYC statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All KYC statuses</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="not_required">Not Required</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}