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
  priority: string;
  category: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface DisputesFilterProps {
  onFilter: (filters: FilterState) => void;
}

export function DisputesFilter({ onFilter }: DisputesFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all',
    priority: 'all',
    category: 'all',
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  const isMobile = useIsMobile();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilter(updated);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: '',
      status: 'all',
      priority: 'all',
      category: 'all',
      dateRange: { from: undefined, to: undefined },
    };
    setFilters(clearedFilters);
    onFilter(clearedFilters);
  };

  const hasActiveFilters = filters.search || 
    filters.status !== 'all' || 
    filters.priority !== 'all' || 
    filters.category !== 'all' ||
    filters.dateRange.from || 
    filters.dateRange.to;

  const activeFilterCount = [
    filters.search,
    filters.status !== 'all' ? filters.status : null,
    filters.priority !== 'all' ? filters.priority : null,
    filters.category !== 'all' ? filters.category : null,
    filters.dateRange.from || filters.dateRange.to ? 'date' : null
  ].filter(Boolean).length;

  const DesktopFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filter Disputes
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFilterCount}
            </Badge>
          )}
        </h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4 mr-1" />
            Clear All Filters
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {/* Search */}
        <div className="2xl:col-span-2 xl:col-span-2 lg:col-span-2 sm:col-span-2 col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search disputes, trade IDs, or participants..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="pl-10"
            />
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
              <SelectItem value="escalated">Escalated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <Select value={filters.priority} onValueChange={(value) => updateFilters({ priority: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="payment">Payment Issue</SelectItem>
              <SelectItem value="fraud">Fraud/Scam</SelectItem>
              <SelectItem value="technical">Technical Issue</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !filters.dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateRange.from ? (
                  filters.dateRange.to ? (
                    <>
                      {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                      {format(filters.dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(filters.dateRange.from, "LLL dd, y")
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
                selected={{
                  from: filters.dateRange.from,
                  to: filters.dateRange.to,
                }}
                onSelect={(range) => updateFilters({ 
                  dateRange: { 
                    from: range?.from, 
                    to: range?.to 
                  } 
                })}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {filters.search}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ search: '' })}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Status: {filters.status}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ status: 'all' })}
              />
            </Badge>
          )}
          {filters.priority !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Priority: {filters.priority}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ priority: 'all' })}
              />
            </Badge>
          )}
          {filters.category !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Category: {filters.category}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ category: 'all' })}
              />
            </Badge>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date Range
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => updateFilters({ dateRange: { from: undefined, to: undefined } })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );

  const MobileFilters = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {showMobileFilters && (
        <div className="space-y-4 border rounded-lg p-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search disputes..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => updateFilters({ priority: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Select value={filters.category} onValueChange={(value) => updateFilters({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="payment">Payment Issue</SelectItem>
                  <SelectItem value="fraud">Fraud/Scam</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateRange.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange.from ? (
                      filters.dateRange.to ? (
                        <>
                          {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                          {format(filters.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(filters.dateRange.from, "LLL dd, y")
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
                    selected={{
                      from: filters.dateRange.from,
                      to: filters.dateRange.to,
                    }}
                    onSelect={(range) => updateFilters({ 
                      dateRange: { 
                        from: range?.from, 
                        to: range?.to 
                      } 
                    })}
                    numberOfMonths={1}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t">
              {filters.search && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {filters.search}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilters({ search: '' })}
                  />
                </Badge>
              )}
              {filters.status !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Status: {filters.status}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilters({ status: 'all' })}
                  />
                </Badge>
              )}
              {filters.priority !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Priority: {filters.priority}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilters({ priority: 'all' })}
                  />
                </Badge>
              )}
              {filters.category !== 'all' && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Category: {filters.category}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilters({ category: 'all' })}
                  />
                </Badge>
              )}
              {(filters.dateRange.from || filters.dateRange.to) && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date Range
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => updateFilters({ dateRange: { from: undefined, to: undefined } })}
                  />
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  return isMobile ? <MobileFilters /> : <DesktopFilters />;
}