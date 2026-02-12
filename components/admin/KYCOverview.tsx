'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Eye, ShieldCheck, ShieldX, FileText, Ban, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface KYCRecord {
  id: string;
  name: string;
  legalName: string; // Full legal name as on ID
  email: string;
  phone?: string;
  address?: string;
  documentType?: string;
  frontIdImage?: string; // Front of ID document
  backIdImage?: string; // Back of ID document
  selfieImage?: string; // Selfie image if submitted
  submittedAt: string;
  status: string;
  documents: string[]; // For now just names
  
  // Extended KYC fields
  firstName?: string;
  lastName?: string;
  otherName?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  countryOfResidence?: string;
  stateRegion?: string;
  idType?: string;
  issuingCountry?: string;
  idNumber?: string;
}

interface KYCOverviewProps {
  records: KYCRecord[];
  onApprove: (id: string) => Promise<void> | void;
  onReject: (id: string, reason: string) => Promise<void> | void;
  onSuspend?: (id: string, reason: string) => Promise<void> | void;
}

export function KYCOverview({ records, onApprove, onReject, onSuspend }: KYCOverviewProps) {
  const [selected, setSelected] = useState<KYCRecord | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const isLikelyImageUrl = (s?: string) => !!s && (/^https?:\/\//.test(s) || /^data:image\//.test(s));

  const openRecord = (rec: KYCRecord) => {
    setSelected(rec);
  };

  const handleApprove = async () => {
    if (!selected) return;
    setProcessing(true);
    try {
      await onApprove(selected.id);
      toast({
        title: 'KYC Approved',
        description: `${selected.name}'s verification has been approved.`
      });
      setSelected(null);
    } catch (e) {
      toast({
        title: 'Approval Failed',
        description: 'There was an issue approving this KYC request.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!reason.trim()) return;
    setProcessing(true);
    try {
      const r = reason.trim();
      await onReject(selected.id, r);
      toast({
        title: 'KYC Rejected',
        description: `${selected.name}'s verification was rejected.`
      });
      setReason('');
      setRejectOpen(false);
      setSelected(null);
    } catch (e) {
      toast({
        title: 'Rejection Failed',
        description: 'There was an issue rejecting this KYC request.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSuspend = async () => {
    if (!selected || !onSuspend) return;
    if (!suspendReason.trim()) return;
    setProcessing(true);
    try {
      const r = suspendReason.trim();
      await onSuspend(selected.id, r);
      toast({
        title: 'Merchant Suspended',
        description: `${selected.name} has been suspended.`,
        variant: 'destructive'
      });
      setSuspendReason('');
      setSuspendOpen(false);
      setSelected(null);
    } catch (e) {
      toast({
        title: 'Suspension Failed',
        description: 'There was an issue suspending this merchant.',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.name}</div>
                  <div className="text-xs text-gray-500">{r.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                    <FileText className="w-3 h-3" /> {r.documentType || 'ID Document'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(r.submittedAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn(
                    'px-2 py-1 rounded-full text-xs font-medium',
                    r.status === 'pending' && 'bg-yellow-50 text-yellow-700',
                    r.status === 'approved' && 'bg-green-50 text-green-700',
                    r.status === 'rejected' && 'bg-red-50 text-red-700'
                  )}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="hover:bg-gray-100" onClick={() => openRecord(r)}>
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                    <Button size="sm" className="bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white" onClick={() => openRecord(r)}>
                      Manage
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View/Manage Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && !processing && setSelected(null)}>
        <DialogContent className="max-w-[95vw] lg:max-w-7xl grid grid-cols-1 lg:grid-cols-5 gap-8 p-8 max-h-[85vh] overflow-y-auto">
          {selected && (
            <>
              <div className="lg:col-span-3 space-y-6">
                <DialogHeader className="space-y-1">
                  <DialogTitle className="text-xl font-semibold tracking-tight">KYC Details</DialogTitle>
                  <DialogDescription className="text-sm text-gray-500">
                    Review the submitted identity information before taking action.
                  </DialogDescription>
                </DialogHeader>
                
                {/* Personal Information Section */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pl-3.5">
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">First Name</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.firstName || selected.name.split(' ')[0] || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Last Name</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.lastName || selected.name.split(' ')[1] || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Other Name</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.otherName || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Gender</p>
                      <p className="font-medium text-gray-900 text-sm capitalize">{selected.gender || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Date of Birth</p>
                      <p className="font-medium text-gray-900 text-sm">
                        {selected.dateOfBirth ? new Date(selected.dateOfBirth).toLocaleDateString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Phone Number</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.phone || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Location Information Section */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                    Location Information
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pl-3.5">
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Nationality</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.nationality || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Country of Residence</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.countryOfResidence || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">State/Region</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.stateRegion || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs uppercase text-gray-500 mb-1">Address</p>
                      <p className="font-medium text-gray-900 text-sm leading-snug">{selected.address || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Identification Section */}
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-600"></div>
                    Identification
                  </h4>
                  <div className="grid grid-cols-2 gap-3 pl-3.5">
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">ID Type</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.idType || selected.documentType || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-gray-500 mb-1">Issuing Country</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.issuingCountry || '—'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs uppercase text-gray-500 mb-1">ID Number</p>
                      <p className="font-medium text-gray-900 text-sm">{selected.idNumber || '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-2">
                  <div>
                    <p className="text-xs uppercase text-gray-500 mb-1">Email</p>
                    <p className="font-medium text-gray-900">{selected.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {selected.status === 'rejected' || selected.status === 'suspended' ? (
                    <>
                      {/* Show status badge for rejected/suspended */}
                      <div className="col-span-2 mb-2">
                        <div className={cn(
                          'p-3 rounded-lg flex items-center gap-2',
                          selected.status === 'rejected' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
                        )}>
                          <AlertTriangle className={cn(
                            'w-5 h-5',
                            selected.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                          )} />
                          <div>
                            <p className={cn(
                              'text-sm font-semibold',
                              selected.status === 'rejected' ? 'text-red-900' : 'text-orange-900'
                            )}>
                              {selected.status === 'rejected' ? 'KYC Rejected' : 'Merchant Suspended'}
                            </p>
                            <p className="text-xs text-gray-600">
                              {selected.status === 'rejected' 
                                ? 'This merchant\'s KYC verification was rejected' 
                                : 'This merchant has been suspended from the platform'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons for rejected/suspended merchants */}
                      <Button 
                        disabled={processing} 
                        onClick={handleApprove} 
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" /> 
                        {selected.status === 'suspended' ? 'Approve & Unsuspend' : 'Approve'}
                      </Button>
                      
                      {selected.status === 'rejected' && onSuspend && (
                        <Button 
                          disabled={processing} 
                          onClick={() => setSuspendOpen(true)} 
                          variant="outline" 
                          className="border-orange-500 text-orange-600 hover:bg-orange-50 flex items-center gap-2"
                        >
                          <Ban className="w-4 h-4" /> Suspend Merchant
                        </Button>
                      )}
                    </>
                  ) : selected.status === 'pending' ? (
                    <>
                      {/* Normal approve/reject buttons for pending */}
                      <Button disabled={processing} onClick={handleApprove} className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Approve
                      </Button>
                      <Button disabled={processing} onClick={() => setRejectOpen(true)} variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 flex items-center gap-2">
                        <ShieldX className="w-4 h-4" /> Reject
                      </Button>
                    </>
                  ) : (
                    <div className="col-span-2">
                      <div className="p-3 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-900">This KYC is already approved. No action needed.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                <p className="text-xs uppercase text-gray-500 tracking-wide">Submitted Documents</p>
                
                {/* Front and Back ID Images */}
                <div className="space-y-3">
                  {selected.frontIdImage && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">ID Front</p>
                      <div className="group relative rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={selected.frontIdImage}
                          alt="ID Front"
                          className="w-full max-h-[320px] object-contain cursor-pointer group-hover:scale-[1.01] transition-transform"
                          style={{ height: 'auto' }}
                          onClick={() => window.open(selected.frontIdImage, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    </div>
                  )}
                  
                  {selected.backIdImage && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">ID Back</p>
                      <div className="group relative rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={selected.backIdImage}
                          alt="ID Back"
                          className="w-full max-h-[320px] object-contain cursor-pointer group-hover:scale-[1.01] transition-transform"
                          style={{ height: 'auto' }}
                          onClick={() => window.open(selected.backIdImage, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    </div>
                  )}

                  {selected.selfieImage && isLikelyImageUrl(selected.selfieImage) && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">Selfie</p>
                      <div className="group relative rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={selected.selfieImage}
                          alt="Selfie"
                          className="w-full max-h-[320px] object-contain cursor-pointer group-hover:scale-[1.01] transition-transform"
                          style={{ height: 'auto' }}
                          onClick={() => window.open(selected.selfieImage!, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    </div>
                  )}
                  
                  {/* Render any submitted document URLs if available */}
                  {(!selected.frontIdImage || !selected.backIdImage) && Array.isArray(selected.documents) && selected.documents
                    .filter((d) => isLikelyImageUrl(d))
                    .map((src, idx) => (
                      <div key={idx} className="group relative rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={src}
                          alt={`Document ${idx + 1}`}
                          className="w-full max-h-[320px] object-contain cursor-pointer group-hover:scale-[1.01] transition-transform"
                          style={{ height: 'auto' }}
                          onClick={() => window.open(src, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                </div>
                
                <p className="text-[11px] text-gray-400">Click any document to open full size in a new tab.</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Rejection Reason Modal */}
      <Dialog open={rejectOpen} onOpenChange={(o) => !o && !processing && setRejectOpen(o)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Reject KYC Request</DialogTitle>
            <DialogDescription>Provide a clear reason for rejection. This will be sent to the user.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for rejection (e.g., Document is blurry, mismatch in details, incomplete submission)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter className="flex gap-3 pt-2">
            <Button variant="outline" disabled={processing} onClick={() => { setReason(''); setRejectOpen(false); }}>Cancel</Button>
            <Button disabled={!reason.trim() || processing} onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">Confirm Rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Merchant Modal */}
      <Dialog open={suspendOpen} onOpenChange={(o) => !o && !processing && setSuspendOpen(o)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Ban className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">Suspend Merchant</DialogTitle>
                <DialogDescription className="text-sm">This action will prevent the merchant from accessing the platform.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-900 font-medium mb-1">⚠️ Warning</p>
              <p className="text-xs text-orange-800">
                Suspending this merchant will immediately block their account access and freeze all transactions.
                They can be reactivated by approving their KYC later.
              </p>
            </div>
            <Textarea
              placeholder="Reason for suspension (e.g., Fraudulent activity, policy violation, security concerns)"
              value={suspendReason}
              onChange={e => setSuspendReason(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          <DialogFooter className="flex gap-3 pt-2">
            <Button variant="outline" disabled={processing} onClick={() => { setSuspendReason(''); setSuspendOpen(false); }}>Cancel</Button>
            <Button 
              disabled={!suspendReason.trim() || processing} 
              onClick={handleSuspend} 
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Confirm Suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
