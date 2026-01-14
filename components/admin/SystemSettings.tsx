'use client';

import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface SystemToggles {
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  p2pTransfersEnabled: boolean;
  kycRequired: boolean;
}

interface SystemSettingsProps {
  settings: SystemToggles;
  onUpdate: (type: string, data: any) => Promise<void>;
}

export function SystemSettings({ settings, onUpdate }: SystemSettingsProps) {
  const handleToggle = async (setting: keyof SystemToggles, value: boolean) => {
    try {
      await onUpdate('toggle', { setting, value });
    } catch (error) {
      console.error('Failed to update setting:', error);
    }
  };

  const settingsConfig = [
    {
      key: 'depositsEnabled' as const,
      label: 'Enable Deposits',
      description: 'Allow users to deposit funds into their wallets'
    },
    {
      key: 'withdrawalsEnabled' as const,
      label: 'Enable Withdrawals',
      description: 'Allow users to withdraw funds from their wallets'
    },
    {
      key: 'p2pTransfersEnabled' as const,
      label: 'Enable P2P Transfers',
      description: 'Allow peer-to-peer transfers between users'
    },
    {
      key: 'kycRequired' as const,
      label: 'Require KYC',
      description: 'Require KYC verification for non-Nigerian users'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {settingsConfig.map((config) => (
          <div key={config.key} className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{config.label}</Label>
              <div className="text-sm text-gray-500">
                {config.description}
              </div>
            </div>
            <Switch
              checked={settings[config.key]}
              onCheckedChange={(checked) => handleToggle(config.key, checked)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}