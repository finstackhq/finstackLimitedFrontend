'use client';

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useIsMobile } from '../../hooks/use-mobile';
import { 
  Eye, 
  Star,
  CheckCircle, 
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Phone,
  Mail,
  Globe,
  CreditCard,
  TrendingUp,
  Shield,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  country: string;
  status: 'verified' | 'pending' | 'under_review' | 'suspended';
  tier: 'standard' | 'premium' | 'enterprise';
  avatar: string;
  registrationDate: string;
  lastActive: string;
  totalTrades: number;
  totalVolume: number;
  rating: number;
  reviewCount: number;
  paymentMethods: string[];
  verificationDocuments: Array<{
    type: string;
    status: 'approved' | 'pending' | 'under_review' | 'rejected';
    uploadDate: string;
  }>;
  compliance: {
    kycStatus: 'approved' | 'pending' | 'under_review' | 'rejected';
    amlStatus: 'approved' | 'pending' | 'under_review' | 'flagged';
    riskLevel: 'low' | 'medium' | 'high';
  };
  fees: {
    tradingFee: number;
    withdrawalFee: number;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
  };
  suspensionReason?: string;
}

interface MerchantsTableProps {
  merchants: Merchant[];
}

export function MerchantsTable({ merchants }: MerchantsTableProps) {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const isMobile = useIsMobile();

  const getStatusBadge = (status: Merchant['status']) => {
    const variants = {
      verified: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      suspended: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      verified: 'Verified',
      pending: 'Pending',
      under_review: 'Under Review',
      suspended: 'Suspended'
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  const getTierBadge = (tier: Merchant['tier']) => {
    const variants = {
      standard: 'bg-gray-100 text-gray-800 border-gray-200',
      premium: 'bg-purple-100 text-purple-800 border-purple-200',
      enterprise: 'bg-indigo-100 text-indigo-800 border-indigo-200'
    };

    const labels = {
      standard: 'Standard',
      premium: 'Premium',
      enterprise: 'Enterprise'
    };

    return (
      <Badge className={`${variants[tier]} border`}>
        {labels[tier]}
      </Badge>
    );
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <Badge className={`${variants[riskLevel as keyof typeof variants]} border capitalize`}>
        {riskLevel}
      </Badge>
    );
  };

  const getComplianceStatusBadge = (status: string) => {
    const variants = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      flagged: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      approved: 'Approved',
      pending: 'Pending',
      under_review: 'Under Review',
      rejected: 'Rejected',
      flagged: 'Flagged'
    };

    return (
      <Badge className={`${variants[status as keyof typeof variants]} border`}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: Merchant['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${
            i <= rating
              ? 'text-yellow-400 fill-current'
              : 'text-gray-300'
          }`}
        />
      );
    }
    return stars;
  };

  const handleApproveMerchant = () => {
    if (!selectedMerchant) return;
    // In a real app, this would update the merchant status
    console.log('Approving merchant:', selectedMerchant.id);
  };

  const handleSuspendMerchant = () => {
    if (!selectedMerchant) return;
    // In a real app, this would suspend the merchant
    console.log('Suspending merchant:', selectedMerchant.id);
  };

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {merchants.map((merchant) => (
            <div
              key={merchant.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMerchant(merchant)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={merchant.avatar} />
                    <AvatarFallback>{merchant.businessName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{merchant.businessName}</h3>
                    <p className="text-sm text-gray-500">{merchant.ownerName}</p>
                    <p className="text-xs text-gray-400">{merchant.id}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusIcon(merchant.status)}
                  {getStatusBadge(merchant.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tier:</span>
                  {getTierBadge(merchant.tier)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Country:</span>
                  <span className="text-sm font-medium">{merchant.country}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Volume:</span>
                  <span className="text-sm font-medium">{formatCurrency(merchant.totalVolume)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <div className="flex">{renderStars(Math.round(merchant.rating))}</div>
                    <span className="text-sm text-gray-500">({merchant.reviewCount})</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Registered:</span>
                  <span className="text-sm">{formatDate(merchant.registrationDate)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">Risk:</span>
                    {getRiskLevelBadge(merchant.compliance.riskLevel)}
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Merchant Detail Modal */}
        <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
          <DialogContent className="max-w-md h-[90vh] overflow-y-auto">
            {selectedMerchant && (
              <div>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>{selectedMerchant.businessName}</span>
                    {getStatusBadge(selectedMerchant.status)}
                  </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="overview" className="mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4 mt-4">
                    {/* Basic Information */}
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={selectedMerchant.avatar} />
                          <AvatarFallback>{selectedMerchant.businessName.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedMerchant.businessName}</h3>
                          <p className="text-sm text-gray-500">{selectedMerchant.ownerName}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getTierBadge(selectedMerchant.tier)}
                            {getRiskLevelBadge(selectedMerchant.compliance.riskLevel)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedMerchant.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{selectedMerchant.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span>{selectedMerchant.country}</span>
                        </div>
                      </div>
                    </div>

                    {/* Trading Statistics */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Trading Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                            <span className="text-xs text-gray-600">Total Trades</span>
                          </div>
                          <p className="font-medium">{selectedMerchant.totalTrades.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="text-xs text-gray-600">Total Volume</span>
                          </div>
                          <p className="font-medium">{formatCurrency(selectedMerchant.totalVolume)}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs text-gray-600">Rating</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{selectedMerchant.rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({selectedMerchant.reviewCount})</span>
                          </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-purple-600" />
                            <span className="text-xs text-gray-600">Registered</span>
                          </div>
                          <p className="font-medium text-sm">{formatDate(selectedMerchant.registrationDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Payment Methods</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMerchant.paymentMethods.map((method, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <CreditCard className="w-3 h-3 mr-1" />
                            {method}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="compliance" className="space-y-4 mt-4">
                    {/* Compliance Status */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Compliance Status</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">KYC Status:</span>
                          {getComplianceStatusBadge(selectedMerchant.compliance.kycStatus)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">AML Status:</span>
                          {getComplianceStatusBadge(selectedMerchant.compliance.amlStatus)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Risk Level:</span>
                          {getRiskLevelBadge(selectedMerchant.compliance.riskLevel)}
                        </div>
                      </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Verification Documents</h4>
                      <div className="space-y-2">
                        {selectedMerchant.verificationDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm capitalize">{doc.type.replace('_', ' ')}</span>
                            </div>
                            {getComplianceStatusBadge(doc.status)}
                          </div>
                        ))}
                      </div>
                    </div>

                    {selectedMerchant.suspensionReason && (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-900 text-red-600">Suspension Reason</h4>
                        <p className="text-sm text-gray-700 p-3 bg-red-50 rounded-lg border border-red-200">
                          {selectedMerchant.suspensionReason}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4 mt-4">
                    {/* Fees */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Fees</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Trading Fee:</span>
                          <span className="font-medium">{selectedMerchant.fees.tradingFee}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Withdrawal Fee:</span>
                          <span className="font-medium">${selectedMerchant.fees.withdrawalFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Limits */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Limits</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Daily Limit:</span>
                          <span className="font-medium">{formatCurrency(selectedMerchant.limits.dailyLimit)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Monthly Limit:</span>
                          <span className="font-medium">{formatCurrency(selectedMerchant.limits.monthlyLimit)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-4 border-t">
                      {selectedMerchant.status !== 'verified' && selectedMerchant.status !== 'suspended' && (
                        <Button onClick={handleApproveMerchant} className="w-full bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Merchant
                        </Button>
                      )}
                      {selectedMerchant.status !== 'suspended' && (
                        <Button onClick={handleSuspendMerchant} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-2" />
                          Suspend Merchant
                        </Button>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Desktop view
  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Merchant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trading Volume
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr 
                  key={merchant.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedMerchant(merchant)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Avatar className="w-10 h-10 mr-3">
                        <AvatarImage src={merchant.avatar} />
                        <AvatarFallback>{merchant.businessName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{merchant.businessName}</div>
                        <div className="text-sm text-gray-500">{merchant.ownerName}</div>
                        <div className="text-xs text-gray-400">{merchant.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(merchant.status)}
                      {getStatusBadge(merchant.status)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTierBadge(merchant.tier)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{merchant.country}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(merchant.totalVolume)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {merchant.totalTrades.toLocaleString()} trades
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <div className="flex">{renderStars(Math.round(merchant.rating))}</div>
                      <span className="text-sm text-gray-500 ml-1">
                        {merchant.rating > 0 ? merchant.rating.toFixed(1) : 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {merchant.reviewCount} reviews
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRiskLevelBadge(merchant.compliance.riskLevel)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMerchant(merchant);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Desktop Merchant Detail Modal */}
      <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedMerchant && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedMerchant.businessName} - {selectedMerchant.id}</span>
                  {getStatusBadge(selectedMerchant.status)}
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="overview" className="mt-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="compliance">Compliance</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Basic Information */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={selectedMerchant.avatar} />
                            <AvatarFallback>{selectedMerchant.businessName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium text-gray-900 text-lg">{selectedMerchant.businessName}</h3>
                            <p className="text-gray-500">{selectedMerchant.ownerName}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {getTierBadge(selectedMerchant.tier)}
                              {getRiskLevelBadge(selectedMerchant.compliance.riskLevel)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Contact Information</h4>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="flex items-center space-x-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span>{selectedMerchant.email}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span>{selectedMerchant.phone}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Globe className="w-5 h-5 text-gray-400" />
                            <span>{selectedMerchant.country}</span>
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Payment Methods</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMerchant.paymentMethods.map((method, index) => (
                            <Badge key={index} variant="outline">
                              <CreditCard className="w-4 h-4 mr-2" />
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Trading Statistics */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Trading Statistics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <TrendingUp className="w-5 h-5 text-blue-600" />
                              <span className="text-sm text-gray-600">Total Trades</span>
                            </div>
                            <p className="font-medium text-lg">{selectedMerchant.totalTrades.toLocaleString()}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <span className="text-sm text-gray-600">Total Volume</span>
                            </div>
                            <p className="font-medium text-lg">{formatCurrency(selectedMerchant.totalVolume)}</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Star className="w-5 h-5 text-yellow-600" />
                              <span className="text-sm text-gray-600">Rating</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="flex">{renderStars(Math.round(selectedMerchant.rating))}</div>
                              <span className="font-medium">{selectedMerchant.rating > 0 ? selectedMerchant.rating.toFixed(1) : 'N/A'}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">({selectedMerchant.reviewCount} reviews)</p>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <Calendar className="w-5 h-5 text-purple-600" />
                              <span className="text-sm text-gray-600">Registered</span>
                            </div>
                            <p className="font-medium">{formatDate(selectedMerchant.registrationDate)}</p>
                            <p className="text-xs text-gray-500 mt-1">Last active: {formatDate(selectedMerchant.lastActive)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="compliance" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Compliance Status */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Compliance Status</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">KYC Status:</span>
                          {getComplianceStatusBadge(selectedMerchant.compliance.kycStatus)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">AML Status:</span>
                          {getComplianceStatusBadge(selectedMerchant.compliance.amlStatus)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Risk Level:</span>
                          {getRiskLevelBadge(selectedMerchant.compliance.riskLevel)}
                        </div>
                      </div>
                    </div>

                    {/* Verification Documents */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Verification Documents</h4>
                      <div className="space-y-3">
                        {selectedMerchant.verificationDocuments.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <FileText className="w-5 h-5 text-gray-600" />
                              <div>
                                <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                                <p className="text-xs text-gray-500">
                                  Uploaded: {formatDate(doc.uploadDate)}
                                </p>
                              </div>
                            </div>
                            {getComplianceStatusBadge(doc.status)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {selectedMerchant.suspensionReason && (
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 text-red-600">Suspension Reason</h4>
                      <p className="text-gray-700 p-4 bg-red-50 rounded-lg border border-red-200">
                        {selectedMerchant.suspensionReason}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6 mt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Fees */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Fee Structure</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Trading Fee:</span>
                          <span className="font-medium">{selectedMerchant.fees.tradingFee}%</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Withdrawal Fee:</span>
                          <span className="font-medium">${selectedMerchant.fees.withdrawalFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Limits */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900">Trading Limits</h4>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Daily Limit:</span>
                          <span className="font-medium">{formatCurrency(selectedMerchant.limits.dailyLimit)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Monthly Limit:</span>
                          <span className="font-medium">{formatCurrency(selectedMerchant.limits.monthlyLimit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-6 border-t">
                    <h4 className="font-medium text-gray-900">Actions</h4>
                    <div className="flex space-x-3">
                      {selectedMerchant.status !== 'verified' && selectedMerchant.status !== 'suspended' && (
                        <Button onClick={handleApproveMerchant} className="bg-green-600 hover:bg-green-700">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve Merchant
                        </Button>
                      )}
                      {selectedMerchant.status !== 'suspended' && (
                        <Button onClick={handleSuspendMerchant} variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          <XCircle className="w-4 h-4 mr-2" />
                          Suspend Merchant
                        </Button>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}