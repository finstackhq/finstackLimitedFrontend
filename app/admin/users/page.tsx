'use client';

import { useEffect, useState } from 'react';
import { UsersTable } from '@/components/admin/UsersTable';
import { UsersFilter } from '@/components/admin/UsersFilter';

interface User {
  id: string;
  name: string;
  email: string;
  country: string;
  balance: number;
  currency: string;
  kycStatus: string;
  status: string;
  joinedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    kycStatus: 'all'
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
          setFilteredUsers(data);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (filters.search) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(user => user.status === filters.status);
    }

    if (filters.kycStatus && filters.kycStatus !== 'all') {
      filtered = filtered.filter(user => user.kycStatus === filters.kycStatus);
    }

    setFilteredUsers(filtered);
  }, [users, filters]);

  const handleUserAction = async (id: string, action: 'suspend' | 'activate' | 'delete') => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (response.ok) {
        // Update the user in the list
        setUsers(prev => prev.map(user => {
          if (user.id === id) {
            if (action === 'delete') {
              return null; // Mark for removal
            }
            return {
              ...user,
              status: action === 'suspend' ? 'suspended' : 'active'
            };
          }
          return user;
        }).filter(Boolean) as User[]);
      }
    } catch (error) {
      console.error('Failed to process user action:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch('/api/admin/update-role', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (response.ok) {
        // Update the user's role in the list
        setUsers(prev => prev.map(user => {
          if (user.id === userId) {
            return { ...user, role: newRole };
          }
          return user;
        }));
      }
    } catch (error) {
      console.error('Failed to change user role:', error);
      throw error; // Re-throw to let the modal handle the error
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Users Management</h1>
        <div className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Users Management</h1>
        <div className="text-xs md:text-sm text-gray-600">
          {filteredUsers.length} of {users.length} users
        </div>
      </div>
      
      <UsersFilter filters={filters} onFiltersChange={setFilters} />
      <UsersTable users={filteredUsers} onAction={handleUserAction} onRoleChange={handleRoleChange} />
    </div>
  );
}