'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const DEFAULT_PRIMARY = ['NGN', 'CNGN', 'USDT', 'USDC'] as const;
const DEFAULT_QUOTE = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'] as const;

interface CurrencySelectorProps {
  onSelect: (base: string, quote: string) => void;
  initialBase?: string;
  initialQuote?: string;
  primaryOptions?: string[]; // buttons row
  quoteOptions?: string[];   // dropdown options
}

export function CurrencySelector({ onSelect, initialBase = 'NGN', initialQuote = 'USDT', primaryOptions, quoteOptions }: CurrencySelectorProps) {
  const [base, setBase] = useState<string>(initialBase);
  const [quote, setQuote] = useState<string>(initialQuote);
  const primary = primaryOptions && primaryOptions.length > 0 ? primaryOptions : Array.from(DEFAULT_PRIMARY);
  const quotes = quoteOptions && quoteOptions.length > 0 ? quoteOptions : Array.from(DEFAULT_QUOTE);

  return (
    <Card className="p-5">
      <div className="mb-3 text-sm text-gray-600">Quick select currencies</div>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {primary.map(c => (
          <button
            key={c}
            onClick={() => setBase(c)}
            className={`p-3 rounded-md border text-sm font-medium transition ${base === c ? 'border-blue-600 bg-blue-50' : 'hover:bg-gray-50'}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">With</span>
        <Select value={quote} onValueChange={setQuote}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Select quote" />
          </SelectTrigger>
          <SelectContent>
            {quotes.map(q => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => onSelect(base, quote)} className="ml-auto">Find Offers</Button>
      </div>
    </Card>
  );
}
