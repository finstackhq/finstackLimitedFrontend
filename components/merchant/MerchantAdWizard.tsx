'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Check, ChevronLeft, ChevronRight, Coins, Shuffle, Tag, Layers, CreditCard, MessageSquare, Eye } from 'lucide-react';
import { saveMerchantAd } from '@/lib/p2p-storage';
import { P2PAd, PaymentMethod } from '@/lib/p2p-mock-data';

// Supported pairs constant
const SUPPORTED_PAIRS = [
  'USDC/RMB','CNGN/RMB',
  'USDC/GHS','CNGN/GHS',
  'USDC/XAF','CNGN/XAF',
  'USDC/XOF','CNGN/XOF',
  'USDC/USD','CNGN/USD',
  'USDC/NGN','CNGN/NGN'
];
const CRYPTOS = ['USDC','CNGN'];
const FIATS = ['RMB','GHS','XAF','XOF','USD', 'NGN'];
const TIME_LIMITS = [15,30,60]; // minutes

type TradeType = 'buy' | 'sell';
type PriceType = 'fixed' | 'floating';

interface MerchantAdDraft {
  tradeType: TradeType;
  pair: string; // e.g. USDC/RMB
  baseRate: number; // computed live rate for pair
  priceType: PriceType;
  fixedPrice?: number; // if fixed
  margin?: number; // % if floating (positive or negative)
  floatingDisplayPrice?: number; // derived
  minLimit?: number;
  maxLimit?: number;
  totalAvailable?: number;
  paymentMethods: string[];
  alipayAccountName?: string;
  alipayEmail?: string;
  alipayQrImage?: string; // base64 or url
  customAccountDetails?: string;
  autoReply?: string;
  instructions?: string;
  timeLimit?: number; // in minutes
}

const steps = [
  { label: 'Trade Type', icon: Coins },
  { label: 'Currency Pair', icon: Shuffle },
  { label: 'Pricing', icon: Tag },
  { label: 'Limits', icon: Layers },
  { label: 'Payments', icon: CreditCard },
  { label: 'Instructions', icon: MessageSquare },
  { label: 'Review', icon: Eye }
];

const stepVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 }
};

export function MerchantAdWizard() {
  const { toast } = useToast();
  const [current, setCurrent] = useState(0);
  const [loadingRates, setLoadingRates] = useState(true);
  const [rates, setRates] = useState<Record<string, number>>({}); // USD base
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [customMethod, setCustomMethod] = useState('');

  const [ad, setAd] = useState<MerchantAdDraft>({
    tradeType: 'buy',
    pair: 'USDC/USD',
    baseRate: 1,
    priceType: 'fixed',
    fixedPrice: 1,
    paymentMethods: ['Bank Transfer'],
    autoReply: '',
    instructions: '',
    timeLimit: 30
  });

  // Fetch live exchange rates (USD base)
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoadingRates(true);
        setFetchError(null);
        const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await res.json();
        if (!data?.rates) throw new Error('Invalid rate payload');
        setRates(data.rates);
        setLastUpdated(new Date());
      } catch (e: any) {
        setFetchError(e.message || 'Failed fetching rates');
      } finally {
        setLoadingRates(false);
      }
    };
    fetchRates();
    const id = setInterval(fetchRates, 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Compute base rate for selected pair
  const computedBaseRate = useMemo(() => {
    const [crypto, fiat] = ad.pair.split('/') as [string, string];
    if (!rates || Object.keys(rates).length === 0) return 0;
    if (crypto === 'USDC') {
      if (fiat === 'USD') return 1; // 1 USDC = 1 USD
      return rates[fiat] || 0; // USD -> fiat
    }
    // CNGN assumed pegged to NGN; 1 CNGN = 1 NGN
    const usdToFiat = fiat === 'USD' ? 1 : rates[fiat];
    const usdToNGN = rates['NGN'];
    if (!usdToFiat || !usdToNGN) return 0;
    // 1 NGN in fiat = (usdToFiat / usdToNGN)
    return usdToFiat / usdToNGN;
  }, [ad.pair, rates]);

  // Derive floating display price
  const floatingDisplayPrice = useMemo(() => {
    if (ad.priceType !== 'floating' || !computedBaseRate) return undefined;
    const margin = ad.margin || 0;
    return parseFloat((computedBaseRate * (1 + margin / 100)).toFixed(6));
  }, [ad.priceType, ad.margin, computedBaseRate]);

  // Sync base & floating display into ad state when dependencies change
  useEffect(() => {
    setAd(prev => ({
      ...prev,
      baseRate: computedBaseRate,
      floatingDisplayPrice: prev.priceType === 'floating' ? floatingDisplayPrice : undefined,
      fixedPrice: prev.priceType === 'fixed' && prev.pair !== prev.pair ? prev.fixedPrice : prev.fixedPrice
    }));
  }, [computedBaseRate, floatingDisplayPrice]);

  const canProceed = useMemo(() => {
    switch (current) {
      case 0:
        return !!ad.tradeType;
      case 1:
        return !!ad.pair && computedBaseRate > 0;
      case 2:
        return ad.priceType === 'fixed' ? !!ad.fixedPrice && ad.fixedPrice > 0 : typeof ad.margin === 'number';
      case 3:
        return !!ad.minLimit && !!ad.maxLimit && ad.minLimit > 0 && ad.maxLimit >= ad.minLimit && !!ad.timeLimit;
      case 4:
        return ad.paymentMethods.length > 0;
      case 5:
        return true; // instructions optional
      case 6:
        return true;
      default:
        return false;
    }
  }, [current, ad, computedBaseRate]);

  const next = () => { if (current < steps.length - 1 && canProceed) setCurrent(c => c + 1); };
  const prev = () => { if (current > 0) setCurrent(c => c - 1); };

  const update = <K extends keyof MerchantAdDraft>(key: K, value: MerchantAdDraft[K]) => {
    setAd(prev => ({ ...prev, [key]: value }));
  };

  const togglePaymentMethod = (method: string) => {
    setAd(prev => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter(m => m !== method)
        : [...prev.paymentMethods, method]
    }));
  };

  const addCustomMethod = () => {
    const m = customMethod.trim();
    if (!m) return;
    if (!ad.paymentMethods.includes(m)) {
      setAd(prev => ({ ...prev, paymentMethods: [...prev.paymentMethods, m] }));
    }
    setCustomMethod('');
  };

  const publish = async () => {
    console.log('Merchant Ad Published:', { ...ad, floatingDisplayPrice });
    
    try {
      // Convert wizard format to P2PAd format
      const [cryptoCurrency, fiatCurrency] = ad.pair.split('/');

      // Prepare data for backend
      const payload = {
         type: ad.tradeType.toUpperCase(), // "SELL" or "BUY"
         asset: cryptoCurrency,
         fiat: fiatCurrency,
         price: ad.priceType === 'fixed' ? ad.fixedPrice! : (floatingDisplayPrice || ad.fixedPrice!),
         minLimit: ad.minLimit || 0,
         maxLimit: ad.maxLimit || 0,
         availableAmount: ad.totalAvailable || 0,
         paymentMethods: ad.paymentMethods,
         timeLimit: ad.timeLimit || 30,
         instructions: ad.instructions || "Transfer only from your own account.",
         autoReply: ad.autoReply || "I am active."
      };

      const res = await fetch('/api/fstack/merchant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create ad');
      }
      
      // Also dispatch event for backward compatibility (optional)
      const event = new CustomEvent('merchant-ad-published', { detail: { ...ad, floatingDisplayPrice } });
      window.dispatchEvent(event);

      toast({
        title: 'Ad Published',
        description: 'Your P2P ad has been created and is now live.'
      });
      // reset optionally
      setCurrent(0);

    } catch (err: any) {
      console.error('Error saving ad:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to publish ad',
        variant: 'destructive'
      });
    }
  };

  const progressPct = (current / (steps.length - 1)) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress */}
      <div>
        <div className="flex justify-between mb-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const active = i === current;
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center">
                <div className={cn('w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center text-xs md:text-sm font-semibold border transition-all',
                  active ? 'bg-blue-600 text-white border-blue-600 shadow' : 'bg-white text-gray-500 border-gray-300')}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={cn('mt-1 hidden md:block text-[10px] font-medium tracking-wide', active ? 'text-blue-600' : 'text-gray-400')}>{s.label}</span>
              </div>
            );
          })}
        </div>
        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full bg-linear-to-r from-blue-500 to-indigo-600 transition-all" style={{ width: progressPct + '%' }} />
        </div>
      </div>

      <Card className="p-6 relative min-h-[320px]">        
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-6"
          >
            {current === 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Trade Type</h2>
                <div className="grid grid-cols-2 gap-4">
                  {(['buy','sell'] as TradeType[]).map(tt => (
                    <button
                      key={tt}
                      onClick={() => update('tradeType', tt)}
                      className={cn('p-4 rounded-lg border text-left transition shadow-sm',
                        ad.tradeType === tt ? 'border-blue-600 ring-2 ring-blue-200 bg-blue-50' : 'hover:bg-gray-50')}
                    >
                      <p className="font-medium capitalize">{tt}</p>
                      <p className="text-xs text-gray-500 mt-1">{tt === 'buy' ? 'You are buying crypto from users.' : 'You are selling crypto to users.'}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {current === 1 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Currencies</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Crypto Asset</p>
                    <div className="grid grid-cols-2 gap-3">
                      {CRYPTOS.map(c => {
                        const active = ad.pair.startsWith(c + '/');
                        const fiat = ad.pair.split('/')[1];
                        return (
                          <button key={c} onClick={() => {
                            const newPair = `${c}/${fiat}`;
                            if (SUPPORTED_PAIRS.includes(newPair)) update('pair', newPair);
                          }} className={cn('p-4 rounded-lg border text-left transition relative overflow-hidden', active ? 'border-blue-600 ring-2 ring-blue-200 bg-linear-to-br from-blue-50 to-white' : 'hover:bg-gray-50')}> 
                            <span className="text-lg font-semibold">{c}</span>
                            <span className="block text-[11px] text-gray-500 mt-1">Stable Asset</span>
                            {active && <span className="absolute top-2 right-2 text-blue-600 text-xs font-bold">•</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Fiat Currency</p>
                    <div className="grid grid-cols-3 gap-3">
                      {FIATS.map(f => {
                        const crypto = ad.pair.split('/')[0];
                        const active = ad.pair.endsWith('/' + f);
                        const newPair = `${crypto}/${f}`;
                        const disabled = !SUPPORTED_PAIRS.includes(newPair);
                        return (
                          <button key={f} disabled={disabled} onClick={() => update('pair', newPair)} className={cn('p-3 rounded-lg border text-center text-sm font-medium transition relative', active ? 'border-green-600 ring-2 ring-green-200 bg-linear-to-br from-green-50 to-white' : disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50')}> 
                            {f}
                            {active && <span className="absolute top-1 right-1 text-green-600 text-[10px] font-bold">✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-sm text-gray-700 min-h-[24px]">
                  {loadingRates && <span className="text-gray-400">Fetching live rate...</span>}
                  {!loadingRates && fetchError && <span className="text-red-600">{fetchError}</span>}
                  {!loadingRates && !fetchError && computedBaseRate > 0 && (
                    <span className="font-medium">Current rate: 1 {ad.pair.split('/')[0]} = {computedBaseRate.toLocaleString(undefined,{maximumFractionDigits:6})} {ad.pair.split('/')[1]}</span>
                  )}
                </div>
                {lastUpdated && <p className="text-[10px] text-gray-400">Updated {lastUpdated.toLocaleTimeString()}</p>}
              </div>
            )}

            {current === 2 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Pricing</h2>
                <div className="flex gap-4 mb-4">
                  {(['fixed','floating'] as PriceType[]).map(pt => (
                    <button key={pt} onClick={() => update('priceType', pt)} className={cn('px-4 py-2 rounded-md text-sm border', ad.priceType === pt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-gray-50')}>
                      {pt.charAt(0).toUpperCase() + pt.slice(1)}
                    </button>
                  ))}
                </div>
                {ad.priceType === 'fixed' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fixed Price ({ad.pair})</label>
                    <Input type="number" min={0} value={ad.fixedPrice ?? ''} onChange={e => update('fixedPrice', parseFloat(e.target.value))} placeholder="Enter fixed price" />
                    <p className="text-[11px] text-gray-500">Market reference: {computedBaseRate ? computedBaseRate.toLocaleString(undefined,{maximumFractionDigits:6}) : '—'} ({ad.pair})</p>
                  </div>
                )}
                {ad.priceType === 'floating' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Margin (%)</label>
                      <Input type="number" value={ad.margin ?? ''} onChange={e => update('margin', parseFloat(e.target.value))} placeholder="e.g. 2 for +2%" />
                      <p className="text-[11px] text-gray-500 mt-1">Positive or negative value. Applied on live rate {computedBaseRate ? computedBaseRate.toLocaleString(undefined,{maximumFractionDigits:6}) : ''}</p>
                    </div>
                    <div className="p-3 rounded-md bg-blue-50 text-sm">
                      Display Price: <span className="font-semibold">{floatingDisplayPrice ?? '—'} {ad.pair.split('/')[1]}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {current === 3 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Trade Limits</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Min Limit ({ad.pair.split('/')[1]})</label>
                    <Input type="number" min={0} value={ad.minLimit ?? ''} onChange={e => update('minLimit', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Max Limit ({ad.pair.split('/')[1]})</label>
                    <Input type="number" min={0} value={ad.maxLimit ?? ''} onChange={e => update('maxLimit', parseFloat(e.target.value))} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Total Available ({ad.pair.split('/')[0]})</label>
                    <Input type="number" min={0} value={ad.totalAvailable ?? ''} onChange={e => update('totalAvailable', parseFloat(e.target.value))} />
                  </div>
                </div>
                <div className="mt-6">
                  <p className="text-xs font-semibold tracking-wide text-gray-500 mb-2">Time Limit (Buyer must pay within)</p>
                  <div className="flex gap-3">
                    {TIME_LIMITS.map(t => (
                      <button key={t} onClick={() => update('timeLimit', t)} className={cn('px-4 py-2 rounded-md text-sm border font-medium', ad.timeLimit === t ? 'bg-purple-600 text-white border-purple-600 shadow' : 'hover:bg-gray-50')}>{t === 60 ? '1 Hour' : `${t} mins`}</button>
                    ))}
                  </div>
                </div>
                {ad.minLimit && ad.maxLimit && ad.maxLimit < ad.minLimit && (
                  <p className="text-xs text-red-600 mt-2">Max limit must be greater than or equal to Min limit.</p>
                )}
              </div>
            )}

            {current === 4 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Methods</h2>
                <div className="space-y-4">
                  {['Bank Transfer','Mobile Money','Alipay','Custom Account'].map(method => (
                    <label key={method} className="flex items-center gap-3 p-3 border rounded-md cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" checked={ad.paymentMethods.includes(method)} onChange={() => togglePaymentMethod(method)} className="w-4 h-4" />
                      <span className="text-sm font-medium">{method}</span>
                    </label>
                  ))}
                  {/* Alipay details */}
                  {ad.paymentMethods.includes('Alipay') && (
                    <div className="mt-4 space-y-3 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-sm">Alipay Payment Details</h4>
                      <div>
                        <label className="block text-sm font-medium mb-1">Account Name</label>
                        <Input
                          type="text"
                          placeholder="Enter Alipay account name"
                          value={(ad as any).alipayAccountName ?? ''}
                          onChange={e => update('alipayAccountName' as any, e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email/Phone</label>
                        <Input
                          type="text"
                          placeholder="Enter Alipay email or phone"
                          value={(ad as any).alipayEmail ?? ''}
                          onChange={e => update('alipayEmail' as any, e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Alipay QR Code Image</label>
                        <input
                          type="file"
                          accept="image/*"
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              update('alipayQrImage', ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                        {ad.alipayQrImage && (
                          <div className="mt-2">
                            <img src={ad.alipayQrImage} alt="Alipay QR" className="w-32 h-32 object-contain border rounded bg-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {/* Custom Account details */}
                  {ad.paymentMethods.includes('Custom Account') && (
                    <div className="mt-4 space-y-3 p-4 border rounded-lg bg-gray-50">
                      <h4 className="font-medium text-sm">Custom Account Details</h4>
                      <Textarea
                        value={ad.customAccountDetails ?? ''}
                        onChange={e => update('customAccountDetails', e.target.value)}
                        placeholder="Enter account details, instructions, etc."
                        className="min-h-[80px]"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input placeholder="Add custom method" value={customMethod} onChange={e => setCustomMethod(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomMethod(); } }} />
                    <Button type="button" onClick={addCustomMethod} disabled={!customMethod.trim()}>Add</Button>
                  </div>
                  {ad.paymentMethods.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {ad.paymentMethods.map(m => (
                        <span key={m} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs flex items-center gap-1">
                          {m}
                          {(['Bank Transfer','Mobile Money','Alipay','Custom Account'].includes(m)) ? null : (
                            <button onClick={() => togglePaymentMethod(m)} className="text-blue-700 hover:text-blue-900">×</button>
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {current === 5 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Instructions & Auto Reply</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Auto Reply (optional)</label>
                    <Textarea value={ad.autoReply} onChange={e => update('autoReply', e.target.value)} placeholder="Message sent automatically after user places an order." />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Instructions / Terms (optional)</label>
                    <Textarea value={ad.instructions} onChange={e => update('instructions', e.target.value)} placeholder="Provide detailed instructions for the counterparty." className="min-h-[140px]" />
                  </div>
                </div>
              </div>
            )}

            {current === 6 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Review & Publish</h2>
                <div className="space-y-4 text-sm">
                  <ReviewRow label="Trade Type" value={ad.tradeType.toUpperCase()} />
                  <ReviewRow label="Pair" value={ad.pair} />
                  <ReviewRow label="Live Rate" value={computedBaseRate ? `1 ${ad.pair.split('/')[0]} = ${computedBaseRate.toLocaleString(undefined,{maximumFractionDigits:6})} ${ad.pair.split('/')[1]}` : '—'} />
                  <ReviewRow label="Pricing" value={ad.priceType === 'fixed' ? `Fixed @ ${ad.fixedPrice} ${ad.pair.split('/')[1]}` : `Floating @ ${ad.margin}% (Display: ${floatingDisplayPrice} ${ad.pair.split('/')[1]})`} />
                  <ReviewRow label="Limits" value={`${ad.minLimit} - ${ad.maxLimit} ${ad.pair.split('/')[1]}`} />
                  <ReviewRow label="Time Limit" value={ad.timeLimit ? (ad.timeLimit === 60 ? '1 Hour' : ad.timeLimit + ' mins') : '—'} />
                  <ReviewRow label="Total Available" value={`${ad.totalAvailable ?? 0} ${ad.pair.split('/')[0]}`} />
                  <ReviewRow label="Payment Methods" value={ad.paymentMethods.join(', ')} />
                  <ReviewRow label="Auto Reply" value={ad.autoReply || '—'} />
                  <ReviewRow label="Instructions" value={ad.instructions || '—'} />
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" onClick={prev} className="sm:w-auto">Back</Button>
                  <Button onClick={publish} className="bg-green-600 hover:bg-green-700 sm:w-auto flex items-center gap-2">
                    <Check className="w-4 h-4" /> Publish Ad
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation (except on review step) */}
        {current < steps.length - 1 && (
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={prev} disabled={current === 0} className="flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={next} disabled={!canProceed} className="flex items-center gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string; }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 py-2 border-b last:border-0 border-gray-100">
      <span className="md:w-48 text-gray-500 text-xs uppercase tracking-wide">{label}</span>
      <span className="font-medium text-gray-800 wrap-break-word text-sm">{value}</span>
    </div>
  );
}
