"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Info, RefreshCw } from "lucide-react"

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
]

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("NGN")
  const [toCurrency, setToCurrency] = useState("USDT")
  const [amount, setAmount] = useState("1000")
  const [convertedAmount, setConvertedAmount] = useState(0)
  const [exchangeRates, setExchangeRates] = useState({
    NGN: 1635, // USD to NGN
    RMB: 7.24, // USD to RMB
    USDT: 1    // USD to USDT
  })
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch live exchange rates
  const fetchLiveRates = async () => {
    setLoading(true)
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      const data = await response.json()
      setExchangeRates({
        NGN: data.rates.NGN,
        RMB: data.rates.CNY, // Chinese Yuan in the API
        USDT: 1
      })
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch live rates:', error)
      // Keep existing rates as fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveRates()
    // Update every 5 minutes
    const interval = setInterval(fetchLiveRates, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const numAmount = Number.parseFloat(amount) || 0
    let result = 0

    if (fromCurrency === toCurrency) {
      result = numAmount
    } else {
      // Convert through USD
      const amountInUSD = numAmount / exchangeRates[fromCurrency as keyof typeof exchangeRates]
      result = amountInUSD * exchangeRates[toCurrency as keyof typeof exchangeRates]
    }

    setConvertedAmount(result)
  }, [amount, fromCurrency, toCurrency, exchangeRates])

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
  }

  const getBalance = (currency: string) => {
    if (currency === "NGN") return "-- NGN"
    if (currency === "USDT") return "-- USDT"
    if (currency === "RMB") return "-- RMB"
    return "-- " + currency
  }

  const getRate = () => {
    if (fromCurrency === toCurrency) return `1 ${fromCurrency} = 1 ${toCurrency}`
    
    const rate = convertedAmount / (Number.parseFloat(amount) || 1)
    const decimals = fromCurrency === "USDT" || toCurrency === "USDT" ? 6 : 2
    return `1 ${fromCurrency} ≈ ${rate.toFixed(decimals)} ${toCurrency}`
  }

  const getEquivalentValue = () => {
    const amountNum = Number.parseFloat(amount) || 0
    if (fromCurrency === "USDT") {
      return `≈ ₦${(amountNum * exchangeRates.NGN).toLocaleString()}`
    } else if (fromCurrency === "NGN") {
      return `≈ $${(amountNum / exchangeRates.NGN).toFixed(2)}`
    } else if (fromCurrency === "RMB") {
      return `≈ $${(amountNum / exchangeRates.RMB).toFixed(2)}`
    }
    return ''
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg bg-white">
      <div className="relative p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">Currency Converter</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchLiveRates}
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            <p className="text-gray-600">Live exchange rates</p>
            <p className="text-xs text-gray-500 mt-1">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
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
                  {getEquivalentValue()}
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


