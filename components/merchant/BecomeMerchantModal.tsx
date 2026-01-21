'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Shield, ExternalLink, FileText } from 'lucide-react';

interface BecomeMerchantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kycVerified?: boolean;
  onSubmitted?: (status: 'pending') => void;
}

// Placeholder URL - replace with actual Google Doc link when provided
const MERCHANT_APPLICATION_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform";

export function BecomeMerchantModal({ open, onOpenChange, kycVerified = false }: BecomeMerchantModalProps) {
  const handleApplyClick = () => {
    window.open(MERCHANT_APPLICATION_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600" />
            Become a Merchant
          </DialogTitle>
          <DialogDescription>Apply to get merchant privileges: higher limits, instant posting, and more.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Eligibility Requirements */}
          <div className="p-4 rounded-md bg-blue-50 border border-blue-200 text-sm text-blue-800">
            <div className="flex items-start gap-2">
              <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium mb-2">Merchant Requirements</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>KYC verified account</li>
                  <li>Good trading history</li>
                  <li>Valid payment methods configured</li>
                  <li>Minimum balance requirements</li>
                </ul>
              </div>
            </div>
          </div>

          {/* KYC Warning if not verified */}
          {!kycVerified && (
            <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
              <p className="font-medium">⚠️ KYC Required</p>
              <p className="text-yellow-700 mt-1">You must complete KYC verification before applying to become a merchant.</p>
            </div>
          )}

          {/* Application Info */}
          <div className="p-4 rounded-md bg-gray-50 border border-gray-200">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 mb-1">Application Process</p>
                <p className="text-sm text-gray-600">
                  Click the button below to open the merchant application form. Fill out all required details and submit. 
                  We will review your application within 24-48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="flex gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleApplyClick}
            disabled={!kycVerified}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Apply to Become a Merchant
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
