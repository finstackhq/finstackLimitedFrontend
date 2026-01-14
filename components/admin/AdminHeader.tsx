'use client';

import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminHeader() {
  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h2 className="text-base font-semibold text-gray-900 lg:block hidden">
          Admin Dashboard
        </h2>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm">
          <Bell className="w-4 h-4" />
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs font-medium text-gray-700 hidden sm:block">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}