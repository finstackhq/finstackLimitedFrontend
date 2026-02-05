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
  User,
  Loader2
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
    type: 'screenshot' | 'document' | 'transaction' | 'chat_log' | 'bank_statement' | 'image' | 'other';
    url?: string;
    id?: string;
    uploadedBy?: string;
  }>;
  messages: Array<{
    id: string;
    sender: string;
    message: string;
    timestamp: string;
    type: 'user' | 'admin' | 'system';
  }>;
  // New fields
  paymentDetails?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    country?: string;
    alipayQrImage?: string;
    type?: string;
  };
  tradeDetails?: {
    amountFiat: number;
    amountCrypto: number;
    price: number;
    currencySource: string;
    currencyTarget: string;
    provider?: string;
  };
}

interface DisputesTableProps {
  disputes: Dispute[];
}

export function DisputesTable({ disputes }: DisputesTableProps) {
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [resolving, setResolving] = useState(false);
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

  const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const handleResolveDispute = async () => {
    if (!selectedDispute) return;
    setResolving(true);
    
    try {
      const note = newMessage.trim() || "Resolved by admin";

      const res = await fetch(`/api/admin/trades/${selectedDispute.tradeId}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNote: note })
      });

      const data = await res.json();

      if (data.success) {
        setSelectedDispute(null);
        alert('Dispute resolved successfully');
        window.location.reload(); 
      } else {
        alert(data.error || 'Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('An error occurred');
    } finally {
        setResolving(false);
    }
  };

  const handleSendMessage = async () => {
      // Placeholder for sending message logic if implemented
      alert("Message sending not implemented yet");
  };

  return (
    <>
      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {disputes.map((dispute) => (
          <div key={dispute.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4" onClick={() => setSelectedDispute(dispute)}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">{dispute.tradeId}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(dispute.createdAt)}</p>
              </div>
              {getStatusBadge(dispute.status)}
            </div>
            
            <div className="flex items-center gap-3 py-2 border-t border-b border-gray-50">
               <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src={dispute.initiatedBy.avatar} /></Avatar>
                  <Avatar className="h-8 w-8 border-2 border-white"><AvatarImage src={dispute.respondent.avatar} /></Avatar>
               </div>
               <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-900">{dispute.initiatedBy.name}</span> vs <span className="font-medium text-gray-900">{dispute.respondent.name}</span>
               </p>
            </div>

            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">{dispute.category.replace('_', ' ')}</span>
                <span className="font-medium">{formatCurrency(dispute.amount, dispute.currency)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reference / Date</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Parties</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>

              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {disputes.map((dispute) => (
              <tr key={dispute.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedDispute(dispute)}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-500">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{dispute.tradeId}</p>
                      <p className="text-xs text-gray-500">{formatDate(dispute.createdAt)}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex -space-x-2">
                    <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-gray-100">
                      <AvatarImage src={dispute.initiatedBy.avatar} />
                      <AvatarFallback>{dispute.initiatedBy.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Avatar className="h-8 w-8 border-2 border-white ring-1 ring-gray-100">
                       <AvatarImage src={dispute.respondent.avatar} />
                       <AvatarFallback>{dispute.respondent.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-900 text-sm">{formatCurrency(dispute.amount, dispute.currency)}</p>
                  <p className="text-xs text-gray-500">{dispute.category.replace('_', ' ')}</p>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(dispute.status)}
                </td>

                <td className="px-6 py-4 text-right">
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedDispute(dispute); }}>
                    <Eye className="w-4 h-4 text-gray-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dispute Detail Modal */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-6xl w-[95vw] h-[90vh] overflow-y-auto rounded-xl p-0">
          {selectedDispute && (
            <div className="flex flex-col h-full pointer-events-auto">
              {/* Header */}
              <DialogHeader className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                   <div>
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900">Dispute Details</DialogTitle>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <Badge variant="outline" className="font-mono text-xs text-gray-500">
                          Ref: {selectedDispute.tradeId}
                        </Badge>
                        <span className="text-gray-300 text-xs hidden sm:inline">•</span>
                        <span className="text-sm text-gray-500">Opened on {formatDate(selectedDispute.createdAt)}</span>
                      </div>
                   </div>
                   <div className="flex items-center gap-2">
                      {getStatusBadge(selectedDispute.status)}
                      {getPriorityBadge(selectedDispute.priority)}
                   </div>
                </div>
              </DialogHeader>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
                  {/* Left Column: Context & Evidence */}
                  <div className="col-span-1 lg:col-span-12 xl:col-span-8 space-y-6">
                    {/* Participants */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                      <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Involved Parties</h3>
                      </div>
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                               <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarImage src={selectedDispute.initiatedBy.avatar} />
                                  <AvatarFallback>{selectedDispute.initiatedBy.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                               <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedDispute.initiatedBy.name}</p>
                                  <Badge variant="secondary" className="text-[10px] mt-0.5">Initiator</Badge>
                                </div>
                            </div>
                            
                            <div className="hidden sm:flex flex-1 px-4 items-center justify-center">
                               <div className="h-px w-full bg-gray-200 relative">
                                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400 font-medium">VS</span>
                               </div>
                            </div>

                            <div className="flex items-center gap-4 w-full sm:w-auto flex-row-reverse sm:flex-row text-right sm:text-left">
                               <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{selectedDispute.respondent.name}</p>
                                  <div className="flex justify-end sm:justify-start">
                                    <Badge variant="secondary" className="text-[10px] mt-0.5">Respondent</Badge>
                                  </div>
                               </div>
                               <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                                  <AvatarImage src={selectedDispute.respondent.avatar} />
                                  <AvatarFallback>{selectedDispute.respondent.name.charAt(0)}</AvatarFallback>
                               </Avatar>
                            </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade Details */}
                     {selectedDispute.tradeDetails && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                           <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Trade Details</h3>
                           </div>
                           <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                 <p className="text-xs text-gray-500 uppercase">Fiat Amount</p>
                                 <p className="font-semibold">{formatCurrency(selectedDispute.tradeDetails.amountFiat, selectedDispute.tradeDetails.currencySource)}</p>
                              </div>
                              <div>
                                 <p className="text-xs text-gray-500 uppercase">Crypto Amount</p>
                                 <p className="font-semibold">{selectedDispute.tradeDetails.amountCrypto.toFixed(6)} {selectedDispute.tradeDetails.currencyTarget}</p>
                              </div>
                               <div>
                                 <p className="text-xs text-gray-500 uppercase">Rate</p>
                                 <p className="font-semibold">{selectedDispute.tradeDetails.price.toFixed(2)}</p>
                              </div>
                               <div>
                                 <p className="text-xs text-gray-500 uppercase">Provider</p>
                                 <p className="font-semibold">{selectedDispute.tradeDetails.provider || 'N/A'}</p>
                              </div>
                           </div>
                        </div>
                     )}

                     {/* Payment Details */}
                     {selectedDispute.paymentDetails && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                           <div className="bg-gray-50/50 px-5 py-3 border-b border-gray-100">
                              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Details</h3>
                           </div>
                           <div className="p-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase mb-1">Bank / Method</p>
                                     <p className="font-semibold text-gray-900">{selectedDispute.paymentDetails.bankName || 'N/A'}</p>
                                 </div>
                                 
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase mb-1">Account Number</p>
                                     <p className="font-mono text-gray-900">{selectedDispute.paymentDetails.accountNumber || 'N/A'}</p>
                                 </div>
                                 
                                 <div>
                                     <p className="text-xs text-gray-500 uppercase mb-1">Account Name</p>
                                     <p className="font-semibold text-gray-900">{selectedDispute.paymentDetails.accountName || 'N/A'}</p>
                                 </div>

                                 {selectedDispute.paymentDetails.alipayQrImage && (
                                     <div className="col-span-2 mt-2">
                                         <p className="text-xs text-gray-500 uppercase mb-2">Alipay QR Code</p>
                                         <img src={selectedDispute.paymentDetails.alipayQrImage} alt="Alipay QR" className="w-32 h-32 object-contain border rounded-lg" />
                                     </div>
                                 )}
                              </div>
                           </div>
                        </div>
                     )}

                    {/* Description */}
                    <div className="space-y-2">
                       <h3 className="text-sm font-semibold text-gray-900">Claim Description</h3>
                       <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm text-sm text-gray-700 leading-relaxed">
                         {selectedDispute.description}
                       </div>
                    </div>

                    {/* Evidence List */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-gray-900">Evidence & Docs</h3>
                      {selectedDispute.evidence.length > 0 ? (
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {selectedDispute.evidence.map((evidence, i) => (
                               <div key={i} className="group relative rounded-xl border border-gray-200 overflow-hidden bg-white hover:shadow-md transition-shadow">
                                  {evidence.url && (evidence.url.match(/\.(jpeg|jpg|png|gif|webp)$/i) || evidence.type === 'image') ? (
                                      <div className="aspect-video bg-gray-100 relative">
                                          <img src={evidence.url} alt="Evidence" className="w-full h-full object-cover" />
                                          <a 
                                            href={evidence.url} 
                                            target="_blank" 
                                            rel="noreferrer"
                                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                                          >
                                              <Eye className="w-6 h-6" />
                                          </a>
                                      </div>
                                  ) : (
                                       <div className="aspect-video bg-gray-50 flex items-center justify-center">
                                           <FileText className="w-10 h-10 text-gray-300" />
                                       </div>
                                  )}
                                  <div className="p-3">
                                      <p className="text-xs font-medium text-gray-900 truncate capitalize">{evidence.type?.replace('_', ' ') || 'Document'}</p>
                                      <p className="text-[10px] text-gray-500 truncate">Uploaded by: {evidence.uploadedBy || 'Unknown'}</p>
                                       {evidence.url && (
                                           <a href={evidence.url} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline mt-1 block">View Full</a>
                                       )}
                                  </div>
                               </div>
                            ))}
                         </div>
                      ) : (
                         <div className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-8 text-center">
                            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">No evidence documents have been uploaded for this dispute.</p>
                         </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Communication & Action */}
                  <div className="col-span-1 lg:col-span-12 xl:col-span-4 h-full min-h-[500px] flex flex-col">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
                       <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                             <MessageCircle className="w-4 h-4 text-blue-600" />
                             Discussion Log
                          </h3>
                       </div>
                       
                       <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50/30">
                          {selectedDispute.messages.map((message) => (
                            <div key={message.id} className={`flex ${message.sender === 'system' || message.type === 'system' ? 'justify-center' : message.type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                {message.sender === 'system' || message.type === 'system' ? (
                                    <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1.5 rounded-full">
                                        {message.message} • {formatDate(message.timestamp)}
                                    </div>
                                ) : (
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                    message.type === 'admin' 
                                        ? 'bg-blue-600 text-white rounded-tr-none shadow-md' 
                                        : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none shadow-sm'
                                    }`}>
                                    <p>{message.message}</p>
                                    <p className={`text-[10px] mt-1 text-right ${message.type === 'admin' ? 'text-blue-200' : 'text-gray-400'}`}>
                                        {formatDate(message.timestamp)}
                                    </p>
                                    </div>
                                )}
                            </div>
                          ))}
                       </div>

                       <div className="p-4 border-t border-gray-100 bg-white space-y-3">
                          <Textarea 
                             value={newMessage}
                             onChange={(e) => setNewMessage(e.target.value)}
                             placeholder="Type entry or resolution note..."
                             className="resize-none min-h-[80px]"
                          />
                          <div className="grid grid-cols-2 gap-3">
                             <Button variant="outline" onClick={handleSendMessage}>
                                Add Note
                             </Button>
                             <Button 
                                onClick={handleResolveDispute} 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={selectedDispute.status === 'resolved' || resolving}
                             >
                                {resolving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                {resolving ? 'Resolving...' : 'Resolve Dispute'}
                             </Button>
                          </div>
                       </div>
                    </div>
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