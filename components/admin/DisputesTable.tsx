'use client';

import { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useIsMobile } from '../../hooks/use-mobile';
import { 
  Eye, 
  MessageCircle, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  FileText,
  Camera,
  Download,
  Send,
  User
} from 'lucide-react';
import { Textarea } from '../ui/textarea';

interface Dispute {
  id: string;
  tradeId: string;
  initiatedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  respondent: {
    id: string;
    name: string;
    avatar: string;
  };
  amount: number;
  currency: string;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  priority: 'low' | 'medium' | 'high';
  category: 'payment_issue' | 'trade_terms' | 'account_issue' | 'fraud_suspicion';
  description: string;
  createdAt: string;
  lastUpdate: string;
  assignedTo: string;
  resolution?: string;
  evidence: Array<{
    type: 'screenshot' | 'document' | 'transaction' | 'chat_log' | 'bank_statement';
    url?: string;
    id?: string;
  }>;
  messages: Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    type: 'user' | 'admin';
  }>;
}

interface DisputesTableProps {
  disputes: Dispute[];
}

export function DisputesTable({ disputes }: DisputesTableProps) {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const isMobile = useIsMobile();

  const getStatusBadge = (status: Dispute['status']) => {
    const variants = {
      open: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      under_review: 'bg-blue-100 text-blue-800 border-blue-200',
      resolved: 'bg-green-100 text-green-800 border-green-200',
      escalated: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      open: 'Open',
      under_review: 'Under Review',
      resolved: 'Resolved',
      escalated: 'Escalated'
    };

    return (
      <Badge className={`${variants[status]} border`}>
        {labels[status]}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: Dispute['priority']) => {
    const variants = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      high: 'bg-red-100 text-red-800 border-red-200'
    };

    const labels = {
      low: 'Low',
      medium: 'Medium',
      high: 'High'
    };

    return (
      <Badge className={`${variants[priority]} border`}>
        {labels[priority]}
      </Badge>
    );
  };

  const getCategoryLabel = (category: Dispute['category']) => {
    const labels = {
      payment_issue: 'Payment Issue',
      trade_terms: 'Trade Terms',
      account_issue: 'Account Issue',
      fraud_suspicion: 'Fraud Suspicion'
    };
    return labels[category];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const getStatusIcon = (status: Dispute['status']) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'under_review':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'escalated':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDispute) return;
    
    // In a real app, this would send the message to the backend
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  const handleResolveDispute = () => {
    if (!selectedDispute) return;
    
    // In a real app, this would update the dispute status
    console.log('Resolving dispute:', selectedDispute.id);
  };

  const handleEscalateDispute = () => {
    if (!selectedDispute) return;
    
    // In a real app, this would escalate the dispute
    console.log('Escalating dispute:', selectedDispute.id);
  };

  if (isMobile) {
    return (
      <>
        <div className="space-y-4">
          {disputes.map((dispute) => (
            <div
              key={dispute.id}
              className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedDispute(dispute)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{dispute.id}</h3>
                  <p className="text-sm text-gray-500">Trade: {dispute.tradeId}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(dispute.status)}
                  {getStatusBadge(dispute.status)}
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount:</span>
                  <span className="font-medium">{formatCurrency(dispute.amount, dispute.currency)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority:</span>
                  {getPriorityBadge(dispute.priority)}
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm font-medium">{getCategoryLabel(dispute.category)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{formatDate(dispute.createdAt)}</span>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 line-clamp-2">{dispute.description}</p>
              </div>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={dispute.initiatedBy.avatar} />
                    <AvatarFallback>{dispute.initiatedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-gray-500">vs</span>
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={dispute.respondent.avatar} />
                    <AvatarFallback>{dispute.respondent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                </div>
                <Button size="sm" variant="outline">
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Dispute Detail Modal */}
        <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
          <DialogContent className="max-w-md h-[90vh] overflow-y-auto">
            {selectedDispute && (
              <div>
                <DialogHeader>
                  <DialogTitle className="flex items-center justify-between">
                    <span>Dispute {selectedDispute.id}</span>
                    {getStatusBadge(selectedDispute.status)}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                  {/* Basic Information */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trade ID:</span>
                        <span className="font-medium">{selectedDispute.tradeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-medium">{formatCurrency(selectedDispute.amount, selectedDispute.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Priority:</span>
                        {getPriorityBadge(selectedDispute.priority)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{getCategoryLabel(selectedDispute.category)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span>{formatDate(selectedDispute.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Update:</span>
                        <span>{formatDate(selectedDispute.lastUpdate)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Participants</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedDispute.initiatedBy.avatar} />
                          <AvatarFallback>{selectedDispute.initiatedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{selectedDispute.initiatedBy.name}</p>
                          <p className="text-xs text-gray-500">Dispute Initiator</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedDispute.respondent.avatar} />
                          <AvatarFallback>{selectedDispute.respondent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{selectedDispute.respondent.name}</p>
                          <p className="text-xs text-gray-500">Respondent</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Description</h3>
                    <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                      {selectedDispute.description}
                    </p>
                  </div>

                  {/* Evidence */}
                  {selectedDispute.evidence.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-medium text-gray-900">Evidence</h3>
                      <div className="space-y-2">
                        {selectedDispute.evidence.map((evidence, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              {evidence.type === 'screenshot' && <Camera className="w-4 h-4 text-gray-600" />}
                              {evidence.type === 'document' && <FileText className="w-4 h-4 text-gray-600" />}
                              {evidence.type === 'transaction' && <FileText className="w-4 h-4 text-gray-600" />}
                              {evidence.type === 'chat_log' && <MessageCircle className="w-4 h-4 text-gray-600" />}
                              {evidence.type === 'bank_statement' && <FileText className="w-4 h-4 text-gray-600" />}
                              <span className="text-sm capitalize">{evidence.type.replace('_', ' ')}</span>
                            </div>
                            <Button size="sm" variant="ghost">
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Messages</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {selectedDispute.messages.map((message) => (
                        <div key={message.id} className={`p-3 rounded-lg ${
                          message.type === 'admin' ? 'bg-blue-50 border-l-4 border-blue-400' : 'bg-gray-50'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm flex items-center">
                              {message.type === 'admin' && <User className="w-4 h-4 mr-1" />}
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Message */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-gray-900">Add Message</h3>
                    <div className="space-y-2">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="min-h-[80px]"
                      />
                      <Button onClick={handleSendMessage} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t">
                    {selectedDispute.status !== 'resolved' && (
                      <Button onClick={handleResolveDispute} className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    )}
                    {selectedDispute.status !== 'escalated' && selectedDispute.status !== 'resolved' && (
                      <Button onClick={handleEscalateDispute} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate Dispute
                      </Button>
                    )}
                  </div>
                </div>
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
                  Dispute
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {disputes.map((dispute) => (
                <tr 
                  key={dispute.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedDispute(dispute)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        {getStatusIcon(dispute.status)}
                        <div className="ml-2">
                          <div className="text-sm font-medium text-gray-900">{dispute.id}</div>
                          <div className="text-sm text-gray-500">{dispute.tradeId}</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={dispute.initiatedBy.avatar} />
                          <AvatarFallback>{dispute.initiatedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{dispute.initiatedBy.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">vs</span>
                      <div className="flex items-center space-x-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={dispute.respondent.avatar} />
                          <AvatarFallback>{dispute.respondent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{dispute.respondent.name}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(dispute.amount, dispute.currency)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(dispute.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getPriorityBadge(dispute.priority)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getCategoryLabel(dispute.category)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(dispute.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDispute(dispute);
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

      {/* Desktop Dispute Detail Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedDispute && (
            <div>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Dispute {selectedDispute.id} - Trade {selectedDispute.tradeId}</span>
                  {getStatusBadge(selectedDispute.status)}
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 text-lg">Basic Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Trade ID:</span>
                          <p className="font-medium">{selectedDispute.tradeId}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Amount:</span>
                          <p className="font-medium">{formatCurrency(selectedDispute.amount, selectedDispute.currency)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Priority:</span>
                          <div className="mt-1">{getPriorityBadge(selectedDispute.priority)}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Category:</span>
                          <p className="font-medium">{getCategoryLabel(selectedDispute.category)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <p className="font-medium">{formatDate(selectedDispute.createdAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Last Update:</span>
                          <p className="font-medium">{formatDate(selectedDispute.lastUpdate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 text-lg">Participants</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedDispute.initiatedBy.avatar} />
                          <AvatarFallback>{selectedDispute.initiatedBy.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDispute.initiatedBy.name}</p>
                          <p className="text-sm text-gray-500">Dispute Initiator</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={selectedDispute.respondent.avatar} />
                          <AvatarFallback>{selectedDispute.respondent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{selectedDispute.respondent.name}</p>
                          <p className="text-sm text-gray-500">Respondent</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 text-lg">Description</h3>
                    <p className="text-gray-700 p-4 bg-gray-50 rounded-lg">
                      {selectedDispute.description}
                    </p>
                  </div>

                  {/* Evidence */}
                  {selectedDispute.evidence.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900 text-lg">Evidence</h3>
                      <div className="space-y-3">
                        {selectedDispute.evidence.map((evidence, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {evidence.type === 'screenshot' && <Camera className="w-5 h-5 text-gray-600" />}
                              {evidence.type === 'document' && <FileText className="w-5 h-5 text-gray-600" />}
                              {evidence.type === 'transaction' && <FileText className="w-5 h-5 text-gray-600" />}
                              {evidence.type === 'chat_log' && <MessageCircle className="w-5 h-5 text-gray-600" />}
                              {evidence.type === 'bank_statement' && <FileText className="w-5 h-5 text-gray-600" />}
                              <span className="capitalize">{evidence.type.replace('_', ' ')}</span>
                            </div>
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Messages */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 text-lg">Messages</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-lg">
                      {selectedDispute.messages.map((message) => (
                        <div key={message.id} className={`p-3 rounded-lg ${
                          message.type === 'admin' ? 'bg-blue-100 border-l-4 border-blue-400' : 'bg-white'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm flex items-center">
                              {message.type === 'admin' && <User className="w-4 h-4 mr-1" />}
                              {message.sender}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">{message.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Message */}
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900 text-lg">Add Message</h3>
                    <div className="space-y-3">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="min-h-[100px]"
                      />
                      <Button onClick={handleSendMessage} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4 border-t">
                    <h3 className="font-medium text-gray-900 text-lg">Actions</h3>
                    {selectedDispute.status !== 'resolved' && (
                      <Button onClick={handleResolveDispute} className="w-full bg-green-600 hover:bg-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark as Resolved
                      </Button>
                    )}
                    {selectedDispute.status !== 'escalated' && selectedDispute.status !== 'resolved' && (
                      <Button onClick={handleEscalateDispute} variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Escalate Dispute
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}