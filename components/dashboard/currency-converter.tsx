"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ArrowRightLeft, Loader2 } from "lucide-react"
import { P2PAd, P2POrder, Merchant } from "@/lib/p2p-types"
import { OrderModal } from "@/components/p2p/OrderModal"
import { saveOrder } from "@/lib/p2p-storage"
import { formatAdPrice } from "@/lib/p2p-price"

const currencies = [
  { value: "NGN", label: "Nigerian Naira" },
  { value: "CNGN", label: "cNGN" },
  { value: "RMB", label: "Chinese Yuan" },
  { value: "USDC", label: "USD Coin" },
  { value: "XOF", label: "West African CFA" },
  { value: "XAF", label: "Central African CFA" },
  { value: "GHS", label: "Ghanaian Cedi" },
]

type AdResult = {
  id: string
  _id?: string
  asset: string
  fiat: string
  price: number
  availableAmount?: number
  minLimit: number
  maxLimit: number
  timeLimit?: number
  status?: string
  instructions?: string
  autoReply?: string
  paymentMethods?: string[]
  paymentMethodDetails?: any[]
  direction: "BUY" | "SELL"
  estimatedReceive: number
  userId?: { _id?: string; displayName?: string; firstName?: string; lastName?: string }
}

export function CurrencyConverter() {
  const [fromCurrency, setFromCurrency] = useState("NGN")
  const [toCurrency, setToCurrency] = useState("RMB")
  const [amount, setAmount] = useState("1000")
  const [ads, setAds] = useState<AdResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState("")

  const [selectedAd, setSelectedAd] = useState<P2PAd | null>(null)
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)

  const reset = () => {
    setAds([])
    setSearched(false)
    setError("")
  }

  const handleSwap = () => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)
    reset()
  }

  const handleConvert = async () => {
    setError("")
    if (fromCurrency === toCurrency) return setError("Choose two different currencies.")
    if (!(Number(amount) > 0)) return setError("Enter a valid amount.")

    setLoading(true)
    try {
      const qs = new URLSearchParams({ from: fromCurrency, to: toCurrency, amount })
      const res = await fetch(`/api/fstack/ads/convert?${qs}`)
      const text = await res.text()
      let json: any
      try {
        json = JSON.parse(text)
      } catch {
        throw new Error(`Server returned an unexpected response (${res.status}). Please try again.`)
      }
      if (!res.ok) throw new Error(json.message || "Failed to fetch ads")
      setAds(json.data || [])
      setSearched(true)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const merchantName = (ad: AdResult) =>
    ad.userId?.displayName ||
    [ad.userId?.firstName, ad.userId?.lastName].filter(Boolean).join(" ") ||
    "Merchant"

  const openTrade = (ad: AdResult) => {
    const merchantId = ad.userId?._id || "unknown"

    // Same mapping the P2P marketplace page uses
    const p2pAd: P2PAd = {
      id: ad._id || ad.id,
      merchantId,
      // "buy" = the user is buying the asset, "sell" = the user is selling it
      type: ad.direction === "BUY" ? "buy" : "sell",
      cryptoCurrency: ad.asset,
      fiatCurrency: ad.fiat,
      price: ad.price,
      available: ad.availableAmount || 0,
      minLimit: ad.minLimit,
      maxLimit: ad.maxLimit,
      paymentMethods: Array.isArray(ad.paymentMethods) ? ad.paymentMethods : ["Bank Transfer"],
      paymentMethodDetails: ad.paymentMethodDetails || [],
      paymentWindow: ad.timeLimit || 15,
      instructions: ad.instructions || "",
      autoReply: ad.autoReply || "",
      country: "NG",
      isActive: ad.status ? ad.status === "ACTIVE" : true,
    }

    const merchant: Merchant = {
      id: merchantId,
      name: merchantName(ad),
      businessName: `${ad.userId?.firstName || "Merchant"} Trading`,
      rating: 95,
      totalTrades: 0,
      completionRate: 98,
      responseTime: "5 mins",
      verifiedBadge: true,
      activeAds: 1,
      country: "NG",
      joinedDate: new Date().toISOString(),
      languages: ["English"],
    }

    setSelectedAd(p2pAd)
    setSelectedMerchant(merchant)
    setShowOrderModal(true)
  }

  const CurrencySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <Select value={value} onValueChange={(v) => { onChange(v); reset() }}>
      <SelectTrigger className="w-28 bg-white">
        <span className="font-medium">{value}</span>
      </SelectTrigger>
      <SelectContent>
        {currencies.map((c) => (
          <SelectItem key={c.value} value={c.value}>{c.value} - {c.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  return (
    <Card className="border-0 shadow-lg bg-white p-6 space-y-6">
      <h3 className="text-xl font-semibold text-center text-gray-900">Currency Converter</h3>

      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">I have</span>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
          <Input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); reset() }}
            className="bg-transparent border-0 text-xl font-semibold focus-visible:ring-0 p-0 h-auto"
            placeholder="0"
          />
          <CurrencySelect value={fromCurrency} onChange={setFromCurrency} />
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={handleSwap} className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center">
          <ArrowRightLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-gray-700">I want</span>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex-1 text-xl font-semibold text-gray-900">
            {ads.length > 0
              ? `≈ ${ads[0].estimatedReceive.toLocaleString(undefined, { maximumFractionDigits: 6 })}`
              : <span className="text-gray-400">0.00</span>}
          </div>
          <CurrencySelect value={toCurrency} onChange={setToCurrency} />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button onClick={handleConvert} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Convert"}
      </Button>

      {searched && ads.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          No ads match {fromCurrency} → {toCurrency} for this amount.
        </p>
      )}

      {ads.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            {ads.length} ad{ads.length > 1 ? "s" : ""} found
          </p>
          {ads.map((ad, i) => (
            <div key={ad.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <div className="font-medium text-gray-900">
                  {merchantName(ad)} {i === 0 && <span className="ml-2 text-xs text-green-600">Best rate</span>}
                </div>
                <div className="text-sm text-gray-500">
                  {formatAdPrice(ad.price, ad.asset, ad.fiat)}
                </div>
                <div className="text-xs text-gray-400">
                  Limit: {ad.minLimit.toLocaleString()} - {ad.maxLimit.toLocaleString()} {ad.fiat}
                  {ad.timeLimit ? ` · ${ad.timeLimit} min` : ""}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ≈ {ad.estimatedReceive.toLocaleString(undefined, { maximumFractionDigits: 6 })} {toCurrency}
                </div>
                <Button
                  size="sm"
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={ad.asset === "NGN" && ad.direction === "SELL"}
                  onClick={() => openTrade(ad)}
                >
                  Trade
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAd && selectedMerchant && (
        <OrderModal
          ad={selectedAd}
          trader={selectedMerchant}
          open={showOrderModal}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedAd(null)
            setSelectedMerchant(null)
          }}
          onOrderCreated={(order: P2POrder) => saveOrder(order)}
        />
      )}
    </Card>
  )
}