'use client';

import { useCallback, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Percent, Save, ArrowRightLeft, Download, Upload, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const P2P_ASSETS = ['USDC', 'CNGN'] as const;
const P2P_TARGETS = ['RMB', 'GHS', 'XAF', 'XOF', 'USD', 'NGN'] as const;
const FLAT_CURRENCIES = ['NGN', 'USDC', 'CNGN'] as const;

type FeeType = 'P2P' | 'DEPOSIT' | 'WITHDRAWAL';

interface FeeConfig {
  id?: string | number;
  type: string;
  currency: string;
  targetCurrency?: string | null;
  feeAmount: number | string;
  updatedAt?: string;
  updated_at?: string;
}

const TYPE_OPTIONS = [
  { type: 'P2P' as FeeType, icon: ArrowRightLeft, label: 'P2P Trade', desc: 'Percentage per trade' },
  { type: 'DEPOSIT' as FeeType, icon: Download, label: 'Deposit', desc: 'Incoming funds' },
  { type: 'WITHDRAWAL' as FeeType, icon: Upload, label: 'Withdraw', desc: 'Outgoing funds' },
];

const isActiveType = (t: string): t is FeeType => ['P2P', 'DEPOSIT', 'WITHDRAWAL'].includes(t);

// Percent shown to admins <-> decimal rate sent to API
const percentToRate = (pct: number) => Number((pct / 100).toFixed(8));
const rateToPercent = (rate: number) => Number((rate * 100).toFixed(6));

function formatFee(c: FeeConfig): string {
  const amount = Number(c.feeAmount);
  if (!Number.isFinite(amount)) return String(c.feeAmount);
  if (c.type === 'P2P') return `${rateToPercent(amount)}%`;
  if (c.currency === 'NGN') return `₦${amount.toLocaleString('en-NG')} flat`;
  return `${amount} ${c.currency}`;
}

function formatDate(value?: string): string {
  if (!value) return '-';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString();
}

export function FeeSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [configs, setConfigs] = useState<FeeConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [type, setType] = useState<FeeType>('P2P');
  const [currency, setCurrency] = useState<string>('USDC');
  const [targetCurrency, setTargetCurrency] = useState<string>('NGN');
  const [amount, setAmount] = useState<string>('');

  const loadConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/fee-configs', { cache: 'no-store' });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || body?.message || 'Failed to load fee settings');
      setConfigs(Array.isArray(body?.data) ? body.data : []);
      setLoadError(null);
    } catch (e: any) {
      setLoadError(e?.message || 'Failed to load fee settings');
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleTypeChange = (next: FeeType) => {
    setType(next);
    setCurrency(next === 'P2P' ? 'USDC' : next === 'WITHDRAWAL' ? 'NGN' : 'NGN');
    setAmount('');
  };

  const currencyOptions: readonly string[] = type === 'P2P' ? P2P_ASSETS : FLAT_CURRENCIES;
  const parsed = amount.trim() === '' ? NaN : Number(amount);
  const valid = Number.isFinite(parsed) && parsed >= 0 && (type !== 'P2P' || parsed <= 100);

  const handleSubmit = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        type,
        currency,
        feeAmount: type === 'P2P' ? percentToRate(parsed) : parsed,
      };
      if (type === 'P2P') payload.targetCurrency = targetCurrency;

      const res = await fetch('/api/admin/fees-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body?.error || body?.message || 'Failed to update fee');

      toast({
        title: 'Fee Updated',
        description: `${type} fee for ${currency}${type === 'P2P' ? '/' + targetCurrency : ''} saved.`,
      });
      await loadConfigs();
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'Failed to save fee settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const unit = type === 'P2P' ? '%' : currency === 'NGN' ? '₦' : currency;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Percent className="w-5 h-5 text-blue-600" />
            Transaction Fee Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Configure fees for P2P trades, deposits, and withdrawals
          </p>
        </div>

        <div className="mb-8">
          <Label className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">Fee Type</Label>
          <div className="grid grid-cols-3 gap-3">
            {TYPE_OPTIONS.map(({ type: t, icon: Icon, label, desc }) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={cn(
                  'p-4 rounded-xl border text-left transition-all relative overflow-hidden',
                  type === t
                    ? 'border-blue-600 ring-2 ring-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-sm'
                    : 'hover:bg-gray-50 border-gray-200'
                )}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center mb-2',
                    type === t ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                {type === t && <Check className="w-4 h-4 text-blue-600 absolute top-3 right-3" />}
                <p className="font-semibold text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <Label className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
              {type === 'P2P' ? 'Asset' : 'Currency'}
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {currencyOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCurrency(c)}
                  className={cn(
                    'p-3 rounded-lg border text-center text-sm font-semibold transition-all',
                    currency === c
                      ? 'border-emerald-600 ring-2 ring-emerald-200 bg-emerald-50'
                      : 'hover:bg-gray-50 border-gray-200'
                  )}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {type === 'P2P' && (
            <div>
              <Label className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
                Target Fiat Currency
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {P2P_TARGETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTargetCurrency(c)}
                    className={cn(
                      'p-3 rounded-lg border text-center text-sm font-medium transition-all',
                      targetCurrency === c
                        ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50'
                        : 'hover:bg-gray-50 border-gray-200'
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="feeAmount" className="text-xs font-semibold tracking-wide text-gray-500 mb-3 block">
              {type === 'P2P' ? 'Fee (%)' : currency === 'NGN' ? 'Flat Fee (NGN)' : `Fee (${currency})`}
            </Label>
            <div className="relative max-w-xs">
              <Input
                id="feeAmount"
                type="number"
                step="any"
                min="0"
                max={type === 'P2P' ? 100 : undefined}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-12 text-lg font-semibold"
                placeholder="0"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{unit}</span>
            </div>
            {type === 'P2P' && valid && (
              <p className="text-xs text-gray-500 mt-2">Sent to API as rate {percentToRate(parsed)}</p>
            )}
            {type === 'WITHDRAWAL' && currency === 'NGN' && (
              <p className="text-xs text-gray-500 mt-2">
                Shared flat fee for NGN withdrawals via Nomba or 9PSB. The user pays the withdrawal amount plus this
                fee.
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={saving || !valid} className="bg-blue-600 hover:bg-blue-700 px-6">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Fee Setting'}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Current Fee Settings</h3>
        {loadingConfigs ? (
          <div className="animate-pulse bg-gray-200 h-24 rounded-lg" />
        ) : loadError ? (
          <p className="text-sm text-red-600">{loadError}</p>
        ) : configs.length === 0 ? (
          <p className="text-sm text-gray-500">No fee settings saved yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Currency</th>
                  <th className="py-2 pr-4">Target Currency</th>
                  <th className="py-2 pr-4">Fee</th>
                  <th className="py-2">Last Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {configs.map((c, i) => {
                  const active = isActiveType(c.type);
                  return (
                    <tr key={c.id ?? `${c.type}-${c.currency}-${c.targetCurrency ?? ''}-${i}`}>
                      <td className="py-3 pr-4">
                        {active ? (
                          <span className="font-medium">{c.type}</span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span className="font-medium">{c.type}</span>
                            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
                              Legacy - not active
                            </Badge>
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4">{c.currency}</td>
                      <td className="py-3 pr-4">{c.type === 'P2P' ? c.targetCurrency || '-' : '-'}</td>
                      <td className="py-3 pr-4 font-medium">{formatFee(c)}</td>
                      <td className="py-3 text-gray-600">{formatDate(c.updatedAt ?? c.updated_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
