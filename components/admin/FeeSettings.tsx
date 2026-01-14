'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Percent, Save, ArrowRightLeft, Download, Upload, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Currency options
const BASE_CURRENCIES = ['USDC', 'CNGN'] as const;
const TARGET_CURRENCIES = ['RMB', 'GHS', 'XAF', 'XOF', 'USD', 'NGN'] as const;

type FeeType = 'P2P' | 'DEPOSIT' | 'WITHDRAW';
type BaseCurrency = typeof BASE_CURRENCIES[number];
type TargetCurrency = typeof TARGET_CURRENCIES[number];

interface FeeFormData {
  type: FeeType;
  currency: BaseCurrency;
  targetCurrency?: TargetCurrency;
  feeAmount: number;
}

export function FeeSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeType, setActiveType] = useState<FeeType>('P2P');
  
  // Form state
  const [formData, setFormData] = useState<FeeFormData>({
    type: 'P2P',
    currency: 'USDC',
    targetCurrency: 'RMB',
    feeAmount: 0.1,
  });

  const updateFormData = <K extends keyof FeeFormData>(key: K, value: FeeFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleTypeChange = (type: FeeType) => {
    setActiveType(type);
    setFormData(prev => ({
      ...prev,
      type,
      targetCurrency: type === 'P2P' ? prev.targetCurrency || 'RMB' : undefined,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Build payload based on type
      const payload: Record<string, any> = {
        type: formData.type,
        currency: formData.currency,
        feeAmount: formData.feeAmount,
      };

      if (formData.type === 'P2P' && formData.targetCurrency) {
        payload.targetCurrency = formData.targetCurrency;
      }

      const res = await fetch('/api/admin/set-fees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || 'Failed to update fees');
      }

      toast({
        title: 'Fee Updated',
        description: `${formData.type} fee for ${formData.currency}${formData.type === 'P2P' ? '/' + formData.targetCurrency : ''} has been updated successfully.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save fee settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Percent className="w-5 h-5 text-blue-600" />
          Transaction Fee Settings
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Configure fees for P2P trades, deposits, and withdrawals
        </p>
      </div>

      {/* Fee Type Toggle */}
      <div className="mb-8">
        <Label className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
          Fee Type
        </Label>
        <div className="grid grid-cols-3 gap-3">
          {([
            { type: 'P2P' as FeeType, icon: ArrowRightLeft, label: 'P2P Trade', desc: 'Peer-to-peer transactions' },
            { type: 'DEPOSIT' as FeeType, icon: Download, label: 'Deposit', desc: 'Incoming funds' },
            { type: 'WITHDRAW' as FeeType, icon: Upload, label: 'Withdraw', desc: 'Outgoing funds' },
          ]).map(({ type, icon: Icon, label, desc }) => (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              className={cn(
                'p-4 rounded-xl border text-left transition-all relative overflow-hidden',
                activeType === type
                  ? 'border-blue-600 ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm'
                  : 'hover:bg-gray-50 border-gray-200'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  activeType === type ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                {activeType === type && (
                  <span className="absolute top-3 right-3 text-blue-600">
                    <Check className="w-4 h-4" />
                  </span>
                )}
              </div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="space-y-6">
        {/* Base Currency */}
        <div>
          <Label className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
            {activeType === 'P2P' ? 'Base Currency' : 'Currency'}
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {BASE_CURRENCIES.map(currency => {
              const isActive = formData.currency === currency;
              return (
                <button
                  key={currency}
                  onClick={() => updateFormData('currency', currency)}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-all relative overflow-hidden',
                    isActive
                      ? 'border-emerald-600 ring-2 ring-emerald-200 bg-gradient-to-br from-emerald-50 to-white'
                      : 'hover:bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold">{currency}</span>
                      <span className="block text-xs text-gray-500 mt-1">
                        {currency === 'USDC' ? 'USD Coin (Stablecoin)' : 'cNGN (Nigerian Naira)'}
                      </span>
                    </div>
                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Currency (P2P only) */}
        {activeType === 'P2P' && (
          <div>
            <Label className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
              Target Currency
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {TARGET_CURRENCIES.map(currency => {
                const isActive = formData.targetCurrency === currency;
                return (
                  <button
                    key={currency}
                    onClick={() => updateFormData('targetCurrency', currency)}
                    className={cn(
                      'p-3 rounded-lg border text-center text-sm font-medium transition-all relative',
                      isActive
                        ? 'border-purple-600 ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-white'
                        : 'hover:bg-gray-50 border-gray-200'
                    )}
                  >
                    {currency}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Fee Amount */}
        <div>
          <Label htmlFor="feeAmount" className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
            Fee Amount
          </Label>
          <div className="relative max-w-xs">
            <Input
              id="feeAmount"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.feeAmount}
              onChange={(e) => updateFormData('feeAmount', parseFloat(e.target.value) || 0)}
              className="pr-12 text-lg font-semibold"
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              %
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Percentage fee applied to each {activeType.toLowerCase()} transaction
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Fee Configuration Summary</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Type:</span>
              <span className="font-medium">{activeType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Currency:</span>
              <span className="font-medium">{formData.currency}</span>
            </div>
            {activeType === 'P2P' && (
              <div className="flex justify-between">
                <span className="text-gray-500">Target:</span>
                <span className="font-medium">{formData.targetCurrency}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-700 font-medium">Fee Rate:</span>
              <span className="font-bold text-blue-600">{formData.feeAmount}%</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-6"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Fee Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
