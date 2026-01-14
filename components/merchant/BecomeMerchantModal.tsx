'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShieldCheck, Shield, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BecomeMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kycVerified?: boolean;
  onSubmitted?: (status: 'pending') => void;
}

export function BecomeMerchantModal({ open, onOpenChange, kycVerified = false, onSubmitted }: BecomeMerchantModalProps) {
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = kycVerified && businessName.trim().length >= 2 && reason.trim().length >= 10;

  const submit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    toast({ title: 'Application Submitted', description: 'We will review your application within 24-48 hours.' });
    try { localStorage.setItem('merchant-status', 'pending'); } catch {}
    onSubmitted?.('pending');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Become a Merchant</DialogTitle>
          <DialogDescription>Apply to get merchant privileges: higher limits, instant posting, and more.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-800 flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5" />
            <div>
              <p className="font-medium">Eligibility</p>
              <ul className="list-disc list-inside">
                <li>KYC verified</li>
                <li>Good trading history</li>
                <li>Valid payment methods</li>
              </ul>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">Business/Display Name</Label>
            <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Your trade name" className="mt-1" />
          </div>
          <div>
            <Label className="text-sm font-medium">Why do you want to become a merchant?</Label>
            <Textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="Tell us about your trading experience and why you need merchant status" className="mt-1 min-h-[120px]" />
            {!kycVerified && <p className="text-xs text-red-600 mt-1">You must complete KYC before applying.</p>}
          </div>
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canSubmit || loading} onClick={submit} className="bg-green-600 hover:bg-green-700 text-white">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</> : <><ShieldCheck className="w-4 h-4 mr-2" /> Submit Application</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
