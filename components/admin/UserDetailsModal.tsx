'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Activity,
  Wallet,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  balance: number;
  currency: string;
  kycStatus: string;
  status: string;
  role?: string;
  joinedAt: string;
  lastActive?: string;
  totalTransactions?: number;
  flags?: string[];
  notes?: string;
}

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions?: Transaction[];
  onRoleChange?: (userId: string, newRole: string) => Promise<void> | void;
}

export function UserDetailsModal({ user, open, onOpenChange, transactions = [], onRoleChange }: UserDetailsModalProps) {
  const [roleChangeOpen, setRoleChangeOpen] = useState(false);
  const [changingRole, setChangingRole] = useState(false);
  const { toast } = useToast();

  if (!user) return null;

  const handleRoleChange = async (newRole: string) => {
    if (!user || !onRoleChange) return;
    
    setChangingRole(true);
    try {
      await onRoleChange(user.id, newRole);
      
      // Log the role change for audit trail
      const auditLog = {
        userId: user.id,
        userName: user.name,
        action: 'role_change',
        oldRole: user.role || 'user',
        newRole: newRole,
        timestamp: new Date().toISOString(),
        admin: 'current_admin', // In production, get from auth context
      };
      
      // Store in localStorage for demonstration (in production, send to API)
      const existingLogs = JSON.parse(localStorage.getItem('role-change-logs') || '[]');
      existingLogs.push(auditLog);
      localStorage.setItem('role-change-logs', JSON.stringify(existingLogs));
      
      toast({
        title: 'Role Updated Successfully',
        description: `${user.name} has been ${newRole === 'merchant' ? 'upgraded to merchant' : 'changed to ' + newRole}.`,
      });
      
      setRoleChangeOpen(false);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Role Change Failed',
        description: 'There was an error updating the user role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setChangingRole(false);
    }
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'not_required':
      case 'not_submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getKYCStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'rejected':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  // Mock transaction data if not provided
  const userTransactions = transactions.length > 0 ? transactions : [
    { id: '1', type: 'Deposit', amount: 5000, currency: user.currency, date: new Date().toISOString(), status: 'completed' },
    { id: '2', type: 'Withdrawal', amount: 1000, currency: user.currency, date: new Date(Date.now() - 86400000).toISOString(), status: 'completed' },
    { id: '3', type: 'P2P Trade', amount: 2500, currency: user.currency, date: new Date(Date.now() - 172800000).toISOString(), status: 'completed' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-5xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-[#2F67FA] to-blue-600 text-white p-6">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <UserIcon className="w-8 h-8" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold text-white mb-1">
                    {user.name}
                  </DialogTitle>
                  <DialogDescription className="text-blue-100 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </DialogDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge className={cn('text-xs', getStatusColor(user.status))}>
                  {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                </Badge>
                <Badge className={cn('text-xs flex items-center gap-1', getKYCStatusColor(user.kycStatus))}>
                  {getKYCStatusIcon(user.kycStatus)}
                  {user.kycStatus.replace('_', ' ').charAt(0).toUpperCase() + user.kycStatus.slice(1).replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Personal Details */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
              Personal Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Full Name</p>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email Address</p>
                  <p className="text-sm font-medium text-gray-900 break-all">{user.email}</p>
                </div>
              </div>

              {user.phone && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">{user.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Country</p>
                  <p className="text-sm font-medium text-gray-900">{user.country}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Role</p>
                  <p className="text-sm font-medium text-gray-900 capitalize">{user.role || 'User'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Registration Date</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(user.joinedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Wallet Balance */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5 border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Wallet Balance</h3>
                <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(user.balance, user.currency)}</p>
              <p className="text-xs text-gray-600 mt-1">Available Balance</p>
            </div>

            {/* Activity Stats */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Activity</h3>
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Transactions</span>
                  <span className="text-lg font-bold text-gray-900">{user.totalTransactions || 0}</span>
                </div>
                {user.lastActive && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Active</span>
                    <span className="text-xs text-gray-700">{formatDate(user.lastActive)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History Summary */}
          <div className="bg-gray-50 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Recent Transaction History
            </h3>
            <div className="space-y-3">
              {userTransactions.length > 0 ? (
                userTransactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center',
                        transaction.type === 'Deposit' ? 'bg-green-100' : 
                        transaction.type === 'Withdrawal' ? 'bg-red-100' : 'bg-blue-100'
                      )}>
                        <span className="text-xs font-bold">
                          {transaction.type === 'Deposit' ? '↓' : transaction.type === 'Withdrawal' ? '↑' : '↔'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{transaction.type}</p>
                        <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                      <Badge className="text-xs bg-green-100 text-green-800">
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent transactions</p>
              )}
            </div>
          </div>

          {/* Flags & Notes */}
          {(user.flags && user.flags.length > 0) || user.notes ? (
            <div className="bg-yellow-50 rounded-lg p-5 border border-yellow-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-yellow-600" />
                Flags & Notes
              </h3>
              {user.flags && user.flags.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">Active Flags:</p>
                  <div className="flex flex-wrap gap-2">
                    {user.flags.map((flag, index) => (
                      <Badge key={index} className="bg-yellow-200 text-yellow-900">
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {user.notes && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-800">{user.notes}</p>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setRoleChangeOpen(true)}
              variant="outline"
              className="border-[#2F67FA] text-[#2F67FA] hover:bg-[#2F67FA]/10"
              disabled={!onRoleChange}
            >
              <ArrowRightLeft className="w-4 h-4 mr-2" />
              Change Role
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Role Change Confirmation Dialog */}
      <Dialog open={roleChangeOpen} onOpenChange={setRoleChangeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Change User Role</DialogTitle>
                <DialogDescription className="text-sm">Select the new role for {user?.name}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Role Display */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">Current Role</p>
              <Badge className="bg-blue-100 text-blue-800 capitalize">
                {user?.role || 'user'}
              </Badge>
            </div>

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 mb-1">Important Notice</p>
                <p className="text-xs text-amber-800">
                  Changing a user's role will immediately update their permissions and access levels. 
                  This action will be logged in the audit trail.
                </p>
              </div>
            </div>

            {/* Role Options */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900">Select New Role:</p>
              
              <Button
                onClick={() => handleRoleChange('merchant')}
                disabled={changingRole || user?.role === 'merchant'}
                className="w-full justify-start h-auto p-4 bg-white border-2 border-gray-200 hover:border-[#2F67FA] hover:bg-blue-50 text-left"
                variant="outline"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Merchant</p>
                    <p className="text-xs text-gray-600">
                      Can create ads, manage orders, and conduct P2P trading
                    </p>
                  </div>
                  {user?.role === 'merchant' && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                  )}
                </div>
              </Button>

              <Button
                onClick={() => handleRoleChange('user')}
                disabled={changingRole || user?.role === 'user'}
                className="w-full justify-start h-auto p-4 bg-white border-2 border-gray-200 hover:border-[#2F67FA] hover:bg-blue-50 text-left"
                variant="outline"
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Regular User</p>
                    <p className="text-xs text-gray-600">
                      Standard access to buy, trade, and manage personal wallet
                    </p>
                  </div>
                  {user?.role === 'user' && (
                    <Badge className="bg-green-100 text-green-800 text-xs">Current</Badge>
                  )}
                </div>
              </Button>
            </div>

            {/* Audit Trail Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-900">
                <strong>📝 Audit Trail:</strong> This change will be recorded with timestamp, 
                admin details, and the user's information for security and compliance purposes.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3 pt-2">
            <Button
              variant="outline"
              disabled={changingRole}
              onClick={() => setRoleChangeOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
