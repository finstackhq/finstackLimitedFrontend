'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface CancelConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason?: string) => void;
  tradeId: string;
  cryptoAmount: number;
  cryptoCurrency: string;
  isProcessing?: boolean;
}

export function CancelConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  tradeId,
  cryptoAmount,
  cryptoCurrency,
  isProcessing = false
}: CancelConfirmationDialogProps) {
  const [cancelReason, setCancelReason] = useState('');

  const handleConfirm = () => {
    onConfirm(cancelReason.trim() || undefined);
    setCancelReason('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setCancelReason('');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">Cancel Trade?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3">
            <p>
              Are you sure you want to cancel this trade for{' '}
              <span className="font-semibold">{cryptoAmount} {cryptoCurrency}</span>?
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ Important</p>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• This action cannot be undone</li>
                <li>• If you've already made payment, you'll need to contact the merchant for a refund</li>
                <li>• Frequent cancellations may affect your account reputation</li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-2 my-4">
          <Label htmlFor="cancel-reason" className="text-sm">
            Reason for cancellation (optional)
          </Label>
          <Textarea
            id="cancel-reason"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Changed my mind, Found a better price, etc."
            className="min-h-[80px]"
            disabled={isProcessing}
          />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isProcessing}>
            Keep Trade
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isProcessing}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isProcessing ? 'Cancelling...' : 'Yes, Cancel Trade'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
