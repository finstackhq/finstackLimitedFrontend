"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Info } from "lucide-react"
import { convertCurrency } from "@/lib/mock-api"

const currencies = [
  { 
    value: "NGN", 
    label: "Nigerian Naira", 
    symbol: "₦", 
    logo: "https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/f0f01069-7e35-4291-8664-af625c9c9623-nigeria-logo.png"
  },
  { 
    value: "RMB", 
    label: "Chinese Yuan", 
    symbol: "¥", 
    logo: "https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/a0e173f8-1f7d-4317-bead-1182d677213c-rmb.png"
  },
  { 
    value: "USDT", 
    label: "Tether", 
    symbol: "$", 
    logo: "https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/ef95eebe-7923-4b32-87a6-d755b8caba30-usdt%20logo.png"
  },
  { 
    value: "GHS", 
    label: "Ghanaian Cedi", 
    symbol: "₵", 
    logo: "https://otiktpyazqotihijbwhm.supabase.co/storage/v1/object/public/images/30e23345-0bc0-4165-8629-39eb5e1e8be6-cedits.png"
  },
]

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("NGN")
  const [toCurrency, setToCurrency] = useState("USDT")
  const [amount, setAmount] = useState("1000")
  const [convertedAmount, setConvertedAmount] = useState(0)

  useEffect(() => {
    const numAmount = Number.parseFloat(amount) || 0
    const result = convertCurrency(numAmount, fromCurrency, toCurrency)
    setConvertedAmount(result)
  }, [amount, fromCurrency, toCurrency])

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const getBalance = (currency: string) => {
    if (currency === "NGN") return "-- NGN"
    if (currency === "USDT") return "-- USDT"
    if (currency === "RMB") return "-- RMB"
    if (currency === "GHS") return "-- GHS"
    return "-- " + currency
  }

  const getRate = () => {
    const rate = convertedAmount / (Number.parseFloat(amount) || 1)
    return `1${fromCurrency} ≈ ${rate.toFixed(1)} ${toCurrency}`
  }

  const getUSDEquivalent = () => {
    const usdAmount = convertCurrency(Number.parseFloat(amount) || 0, fromCurrency, "USDT")
    return `≈ ${usdAmount.toFixed(5)} USDT`
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
      <div className="relative p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Currency Converter</h3>
            <p className="text-gray-600">Real-time exchange rates</p>
          </div>

          {/* From Currency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">From</span>
              <span className="text-sm text-gray-500">Balance: {getBalance(fromCurrency)}</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent border-0 text-gray-900 text-xl font-semibold placeholder:text-gray-400 focus-visible:ring-0 p-0 h-auto"
                  placeholder="0"
                />
                <div className="text-sm text-gray-500 mt-1">
                  {getUSDEquivalent()}
                </div>
              </div>
              
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger className="w-auto bg-white border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <img 
                      src={currencies.find(c => c.value === fromCurrency)?.logo} 
                      alt={fromCurrency}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">{fromCurrency}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center gap-2">
                        <img 
                          src={currency.logo} 
                          alt={currency.value}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{currency.value}</span>
                        <span className="text-gray-500 text-xs">- {currency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <button
              onClick={handleSwap}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-all duration-200 flex items-center justify-center group"
            >
              <ArrowRightLeft className="w-4 h-4 text-white transition-transform duration-200 group-hover:rotate-180" />
            </button>
          </div>

          {/* To Currency */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">To</span>
              <span className="text-sm text-gray-500">Balance: {getBalance(toCurrency)}</span>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex-1">
                <div className="text-xl font-semibold text-gray-900">
                  {convertedAmount.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                  })}
                </div>
              </div>
              
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger className="w-auto bg-white border-gray-300 text-gray-900 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <img 
                      src={currencies.find(c => c.value === toCurrency)?.logo} 
                      alt={toCurrency}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="font-medium">{toCurrency}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      <div className="flex items-center gap-2">
                        <img 
                          src={currency.logo} 
                          alt={currency.value}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>{currency.value}</span>
                        <span className="text-gray-500 text-xs">- {currency.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Rate Info */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>Rate</span>
            <span className="ml-auto font-medium">{getRate()}</span>
          </div>
        </div>

        {/* Convert Button */}
        <div className="mt-6">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg">
            Convert Now
          </Button>
        </div>
      </div>
    </Card>
  )
}
