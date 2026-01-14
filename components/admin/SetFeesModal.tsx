'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SetFeesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SetFeesModal({ open, onOpenChange }: SetFeesModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fees, setFees] = useState({
    type: 'P2P',
    usdcFee: 0.0001,
    cngnFee: 0.0001
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/set-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fees)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to set fees');
      }

      toast({
        title: 'Fees Updated',
        description: 'P2P transaction fees have been updated successfully'
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Set fees error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update fees',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set P2P Transaction Fees</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Transaction Type</Label>
            <Input
              id="type"
              value={fees.type}
              disabled
              className="mt-1 bg-gray-50"
            />
          </div>

          <div>
            <Label htmlFor="usdcFee">USDC Fee</Label>
            <Input
              id="usdcFee"
              type="number"
              step="0.0001"
              value={fees.usdcFee}
              onChange={(e) => setFees({ ...fees, usdcFee: parseFloat(e.target.value) })}
              placeholder="0.0001"
              className="mt-1"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Fee amount in USDC</p>
          </div>

          <div>
            <Label htmlFor="cngnFee">cNGN Fee</Label>
            <Input
              id="cngnFee"
              type="number"
              step="0.0001"
              value={fees.cngnFee}
              onChange={(e) => setFees({ ...fees, cngnFee: parseFloat(e.target.value) })}
              placeholder="0.0001"
              className="mt-1"
              disabled={loading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Fee amount in cNGN</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Fees'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
