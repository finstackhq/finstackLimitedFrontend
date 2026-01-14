'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Badge } from '../ui/badge';
import { CalendarIcon, Search, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks/use-mobile';

interface FilterState {
  search: string;
  status: string;
  tier: string;
  country: string;
  riskLevel: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface MerchantsFilterProps {
  onFilter: (filters: FilterState) => void;
}

export function MerchantsFilter({ onFilter }: MerchantsFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    tier: 'all',
    country: 'all',
    riskLevel: 'all',
    dateRange: {
      from: undefined,
      to: undefined
    }
  });

  const [showFilters, setShowFilters] = useState(false);
  const isMobile = useIsMobile();

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'verified', label: 'Verified' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const countryOptions = [
    { value: 'all', label: 'All Countries' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Spain', label: 'Spain' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Other', label: 'Other' }
  ];

  const riskLevelOptions = [
    { value: 'all', label: 'All Risk Levels' },
    { value: 'low', label: 'Low Risk' },
    { value: 'medium', label: 'Medium Risk' },
    { value: 'high', label: 'High Risk' }
  ];

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleDateRangeChange = (range: { from: Date | undefined; to: Date | undefined }) => {
    const newFilters = { ...filters, dateRange: range };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearAllFilters = () => {
    const resetFilters = {
      search: '',
      status: 'all',
      tier: 'all',
      country: 'all',
      riskLevel: 'all',
      dateRange: {
        from: undefined,
        to: undefined
      }
    };
    setFilters(resetFilters);
    onFilter(resetFilters);
  };

  const hasActiveFilters = () => {
    return (
      filters.search !== '' ||
      filters.status !== 'all' ||
      filters.tier !== 'all' ||
      filters.country !== 'all' ||
      filters.riskLevel !== 'all' ||
      filters.dateRange.from ||
      filters.dateRange.to
    );
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search !== '') count++;
    if (filters.status !== 'all') count++;
    if (filters.tier !== 'all') count++;
    if (filters.country !== 'all') count++;
    if (filters.riskLevel !== 'all') count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  };

  const getStatusLabel = (value: string) => {
    return statusOptions.find(option => option.value === value)?.label || value;
  };

  const getTierLabel = (value: string) => {
    return tierOptions.find(option => option.value === value)?.label || value;
  };

  const getCountryLabel = (value: string) => {
    return countryOptions.find(option => option.value === value)?.label || value;
  };

  const getRiskLevelLabel = (value: string) => {
    return riskLevelOptions.find(option => option.value === value)?.label || value;
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search merchants, business names, or owners..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter Toggle Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {getActiveFilterCount() > 0 && (
              <Badge variant="secondary" className="ml-1">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
          
          {hasActiveFilters() && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters() && (
          <div className="flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <Badge variant="outline" className="text-xs">
                Status: {getStatusLabel(filters.status)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('status', 'all')}
                />
              </Badge>
            )}
            {filters.tier !== 'all' && (
              <Badge variant="outline" className="text-xs">
                Tier: {getTierLabel(filters.tier)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('tier', 'all')}
                />
              </Badge>
            )}
            {filters.country !== 'all' && (
              <Badge variant="outline" className="text-xs">
                Country: {getCountryLabel(filters.country)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('country', 'all')}
                />
              </Badge>
            )}
            {filters.riskLevel !== 'all' && (
              <Badge variant="outline" className="text-xs">
                Risk: {getRiskLevelLabel(filters.riskLevel)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleFilterChange('riskLevel', 'all')}
                />
              </Badge>
            )}
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="outline" className="text-xs">
                Date Range
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer" 
                  onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
                />
              </Badge>
            )}
          </div>
        )}

        {/* Expandable Filters */}
        {showFilters && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
                <Select value={filters.tier} onValueChange={(value) => handleFilterChange('tier', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Country Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Risk Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {riskLevelOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !filters.dateRange.from && !filters.dateRange.to && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.dateRange.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                            {format(filters.dateRange.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(filters.dateRange.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={filters.dateRange.from}
                      selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
                      onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
                      numberOfMonths={1}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop view
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Filter Merchants</h2>
        {hasActiveFilters() && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear All Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search merchants, business names, or owners..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
          <Select value={filters.tier} onValueChange={(value) => handleFilterChange('tier', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tierOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countryOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Risk Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <Select value={filters.riskLevel} onValueChange={(value) => handleFilterChange('riskLevel', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {riskLevelOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Date Range - Full Width */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date Range</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full md:w-80 justify-start text-left font-normal',
                !filters.dateRange.from && !filters.dateRange.to && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                    {format(filters.dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
              onSelect={(range) => handleDateRangeChange({ from: range?.from, to: range?.to })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters */}
      {hasActiveFilters() && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Active Filters:</span>
            <span className="text-sm text-gray-500">{getActiveFilterCount()} filter(s) applied</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {filters.status !== 'all' && (
              <Badge variant="outline">
                Status: {getStatusLabel(filters.status)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('status', 'all')}
                />
              </Badge>
            )}
            {filters.tier !== 'all' && (
              <Badge variant="outline">
                Tier: {getTierLabel(filters.tier)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('tier', 'all')}
                />
              </Badge>
            )}
            {filters.country !== 'all' && (
              <Badge variant="outline">
                Country: {getCountryLabel(filters.country)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('country', 'all')}
                />
              </Badge>
            )}
            {filters.riskLevel !== 'all' && (
              <Badge variant="outline">
                Risk: {getRiskLevelLabel(filters.riskLevel)}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                  onClick={() => handleFilterChange('riskLevel', 'all')}
                />
              </Badge>
            )}
            {(filters.dateRange.from || filters.dateRange.to) && (
              <Badge variant="outline">
                Date Range: {filters.dateRange.from ? format(filters.dateRange.from, 'MMM dd') : '...'} - {filters.dateRange.to ? format(filters.dateRange.to, 'MMM dd') : '...'}
                <X 
                  className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" 
                  onClick={() => handleDateRangeChange({ from: undefined, to: undefined })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}