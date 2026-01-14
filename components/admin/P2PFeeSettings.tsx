'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Percent, DollarSign, Save } from 'lucide-react';

export interface P2PFeeSettings {
  feeEnabled: boolean;
  feePercentage: number;
  minimumFee: number;
  maximumFee: number;
}

interface P2PFeeSettingsProps {
  onUpdate?: (type: string, data: any) => Promise<void>;
}

export function P2PFeeSettings({ onUpdate }: P2PFeeSettingsProps) {
  const { toast } = useToast();
  const [settings, setSettings] = useState<P2PFeeSettings>({
    feeEnabled: true,
    feePercentage: 0.5,
    minimumFee: 1,
    maximumFee: 100
  });
  const [loading, setLoading] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('p2p-fee-settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Save to localStorage
      localStorage.setItem('p2p-fee-settings', JSON.stringify(settings));
      
      // Call parent update if provided
      if (onUpdate) {
        await onUpdate('p2p-fees', settings);
      }
      
      toast({
        title: 'Settings Saved',
        description: 'P2P transaction fee settings updated successfully.'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = <K extends keyof P2PFeeSettings>(key: K, value: P2PFeeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const calculateFee = (amount: number): number => {
    if (!settings.feeEnabled) return 0;
    const calculatedFee = (amount * settings.feePercentage) / 100;
    return Math.min(Math.max(calculatedFee, settings.minimumFee), settings.maximumFee);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            P2P Transaction Fees
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure transaction fees for P2P trades
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {settings.feeEnabled ? 'Enabled' : 'Disabled'}
          </span>
          <Switch
            checked={settings.feeEnabled}
            onCheckedChange={(checked) => updateSetting('feeEnabled', checked)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {/* Fee Percentage */}
        <div className="space-y-2">
          <Label htmlFor="feePercentage" className="flex items-center gap-2">
            <Percent className="w-4 h-4" />
            Fee Percentage (%)
          </Label>
          <Input
            id="feePercentage"
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={settings.feePercentage}
            onChange={(e) => updateSetting('feePercentage', parseFloat(e.target.value) || 0)}
            disabled={!settings.feeEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-gray-500">
            Percentage fee charged on each P2P transaction (0-10%)
          </p>
        </div>

        {/* Minimum Fee */}
        <div className="space-y-2">
          <Label htmlFor="minimumFee" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Minimum Fee (USD)
          </Label>
          <Input
            id="minimumFee"
            type="number"
            step="0.1"
            min="0"
            value={settings.minimumFee}
            onChange={(e) => updateSetting('minimumFee', parseFloat(e.target.value) || 0)}
            disabled={!settings.feeEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-gray-500">
            Minimum fee charged regardless of transaction amount
          </p>
        </div>

        {/* Maximum Fee */}
        <div className="space-y-2">
          <Label htmlFor="maximumFee" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Maximum Fee (USD)
          </Label>
          <Input
            id="maximumFee"
            type="number"
            step="1"
            min="0"
            value={settings.maximumFee}
            onChange={(e) => updateSetting('maximumFee', parseFloat(e.target.value) || 0)}
            disabled={!settings.feeEnabled}
            className="max-w-xs"
          />
          <p className="text-xs text-gray-500">
            Maximum fee cap for large transactions
          </p>
        </div>

        {/* Fee Preview */}
        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-3">Fee Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[100, 1000, 10000].map(amount => {
              const actualFee = calculateFee(amount);
              return (
                <div key={amount} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Transaction: ${amount}</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${actualFee.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {settings.feeEnabled ? `${((actualFee / amount) * 100).toFixed(2)}% fee` : 'No fee'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
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

// Utility function to get current fee settings
export function getP2PFeeSettings(): P2PFeeSettings {
  if (typeof window === 'undefined') {
    return {
      feeEnabled: true,
      feePercentage: 0.5,
      minimumFee: 1,
      maximumFee: 100
    };
  }
  
  const stored = localStorage.getItem('p2p-fee-settings');
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    feeEnabled: true,
    feePercentage: 0.5,
    minimumFee: 1,
    maximumFee: 100
  };
}

// Utility function to calculate P2P fee
export function calculateP2PFee(amount: number): number {
  const settings = getP2PFeeSettings();
  if (!settings.feeEnabled) return 0;
  
  const calculatedFee = (amount * settings.feePercentage) / 100;
  return Math.min(Math.max(calculatedFee, settings.minimumFee), settings.maximumFee);
}
