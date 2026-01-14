'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { P2PAd } from '@/lib/p2p-mock-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Power, PowerOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditAdModalProps {
  ad: P2PAd;
  open: boolean;
  onClose: () => void;
  onSave: (updatedAd: P2PAd) => void;
}

export function EditAdModal({ ad, open, onClose, onSave }: EditAdModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<P2PAd>(ad);

  // Update formData when ad changes
  useEffect(() => {
    setFormData(ad);
  }, [ad, open]);

  const handleChange = (field: keyof P2PAd, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodToggle = (method: string) => {
    setFormData(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method as any)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method as any]
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.price || formData.price <= 0) {
      toast({
        title: 'Invalid Price',
        description: 'Price must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    if (formData.minLimit >= formData.maxLimit) {
      toast({
        title: 'Invalid Limits',
        description: 'Minimum limit must be less than maximum limit',
        variant: 'destructive'
      });
      return;
    }

    if (formData.paymentMethods.length === 0) {
      toast({
        title: 'Payment Method Required',
        description: 'Select at least one payment method',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    onSave(formData);
    toast({
      title: 'Ad Updated',
      description: 'Your ad has been updated successfully'
    });

    setIsLoading(false);
    onClose();
  };

  const paymentMethodOptions = ['Bank Transfer', 'MTN Mobile Money', 'Alipay', 'Custom Account', 'CNGN Wallet'];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Ad</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Ad Status Toggle */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  formData.isActive !== false ? "bg-green-100" : "bg-gray-100"
                )}>
                  {formData.isActive !== false ? (
                    <Power className="w-5 h-5 text-green-600" />
                  ) : (
                    <PowerOff className="w-5 h-5 text-gray-600" />
                  )}
                </div>
                <div>
                  <Label className="text-base font-semibold">Ad Status</Label>
                  <p className="text-xs text-gray-600">
                    {formData.isActive !== false 
                      ? 'Ad is visible in marketplace' 
                      : 'Ad is hidden from marketplace'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive !== false}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                  disabled={isLoading}
                />
                <span className={cn(
                  "text-sm font-medium",
                  formData.isActive !== false ? "text-green-600" : "text-gray-500"
                )}>
                  {formData.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <Label htmlFor="price">Price ({formData.fiatCurrency})</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value))}
              placeholder="1500"
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Min Limit */}
          <div>
            <Label htmlFor="minLimit">Minimum Limit ({formData.fiatCurrency})</Label>
            <Input
              id="minLimit"
              type="number"
              step="0.01"
              value={formData.minLimit}
              onChange={(e) => handleChange('minLimit', parseFloat(e.target.value))}
              placeholder="100"
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Max Limit */}
          <div>
            <Label htmlFor="maxLimit">Maximum Limit ({formData.fiatCurrency})</Label>
            <Input
              id="maxLimit"
              type="number"
              step="0.01"
              value={formData.maxLimit}
              onChange={(e) => handleChange('maxLimit', parseFloat(e.target.value))}
              placeholder="5000"
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Available Amount */}
          <div>
            <Label htmlFor="available">Available ({formData.cryptoCurrency})</Label>
            <Input
              id="available"
              type="number"
              step="0.000001"
              value={formData.available}
              onChange={(e) => handleChange('available', parseFloat(e.target.value))}
              placeholder="2.5"
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Payment Window */}
          <div>
            <Label htmlFor="paymentWindow">Payment Window (minutes)</Label>
            <Input
              id="paymentWindow"
              type="number"
              value={formData.paymentWindow}
              onChange={(e) => handleChange('paymentWindow', parseInt(e.target.value))}
              placeholder="15"
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          {/* Payment Methods */}
          <div>
            <Label>Payment Methods</Label>
            <div className="space-y-2 mt-2">
              {paymentMethodOptions.map(method => (
                <div key={method} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={method}
                    checked={formData.paymentMethods.includes(method as any)}
                    onChange={() => handlePaymentMethodToggle(method)}
                    disabled={isLoading}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <Label htmlFor={method} className="font-normal cursor-pointer">
                    {method}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <Label htmlFor="instructions">Instructions (optional)</Label>
            <textarea
              id="instructions"
              value={formData.instructions || ''}
              onChange={(e) => handleChange('instructions', e.target.value)}
              placeholder="Add any special instructions for buyers..."
              disabled={isLoading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
