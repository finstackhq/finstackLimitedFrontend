"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, Filter, ShieldCheck, MapPin, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { mockP2PAds, mockMerchants, getMerchant, P2PAd, P2POrder, PaymentMethod, CountryCode } from "@/lib/p2p-mock-data"
import { P2P_CURRENCY_COUNTRIES, P2PCurrency } from "@/lib/constants"
import { TraderProfileModal } from "@/components/p2p/TraderProfileModal"
import { OrderModal } from "@/components/p2p/OrderModal"

export default function P2PMarketplacePage() {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  
  // Filters
  const [filterPair, setFilterPair] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')
  const [filterCountry, setFilterCountry] = useState<string>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('price')

  // Modals
  const [selectedMerchant, setSelectedMerchant] = useState<string | null>(null)
  const [selectedAd, setSelectedAd] = useState<P2PAd | null>(null)
  const [showMerchantModal, setShowMerchantModal] = useState(false)
  const [showOrderModal, setShowOrderModal] = useState(false)

  // Filter and sort ads
  const filterAds = (ads: P2PAd[], type: 'buy' | 'sell') => {
    return ads
      .filter(ad => {
        // When user wants to "buy" crypto, they need merchants who are "selling" (type='sell')
        // When user wants to "sell" crypto, they need merchants who are "buying" (type='buy')
        const correctType = type === 'buy' ? 'sell' : 'buy'
        return ad.type === correctType
      })
      .filter(ad => filterPair === 'all' || `${ad.cryptoCurrency}/${ad.fiatCurrency}` === filterPair)
      .filter(ad => filterPayment === 'all' || ad.paymentMethods.includes(filterPayment as PaymentMethod))
      .filter(ad => filterCountry === 'all' || ad.country === filterCountry)
      .filter(ad => {
        if (verifiedOnly) {
          const merchant = getMerchant(ad.merchantId)
          return merchant?.verifiedBadge === true
        }
        return true
      })
      .filter(ad => {
        if (minPrice && parseFloat(minPrice) > 0 && ad.price < parseFloat(minPrice)) return false
        if (maxPrice && parseFloat(maxPrice) > 0 && ad.price > parseFloat(maxPrice)) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'price') {
          return type === 'buy' ? a.price - b.price : b.price - a.price
        }
        const merchantA = getMerchant(a.merchantId)
        const merchantB = getMerchant(b.merchantId)
        return (merchantB?.rating || 0) - (merchantA?.rating || 0)
      })
  }

  const buyAds = filterAds(mockP2PAds, 'buy')
  const sellAds = filterAds(mockP2PAds, 'sell')

  const handleMerchantClick = (merchantId: string) => {
    setSelectedMerchant(merchantId)
    setShowMerchantModal(true)
  }

  const handleAdClick = (ad: P2PAd) => {
    setSelectedAd(ad)
    setShowOrderModal(true)
  }

  const handleOrderCreated = (order: P2POrder) => {
    const stored = localStorage.getItem('p2p-orders')
    const orders: P2POrder[] = stored ? JSON.parse(stored) : []
    orders.push(order)
    localStorage.setItem('p2p-orders', JSON.stringify(orders))
  }

  // Get unique pairs and countries for filters
  const uniquePairs = Array.from(new Set(mockP2PAds.map(ad => `${ad.cryptoCurrency}/${ad.fiatCurrency}`)))
  const uniqueCountries = Array.from(new Set(mockP2PAds.map(ad => ad.country)))
  const paymentMethods: PaymentMethod[] = ['Bank Transfer', 'MTN Mobile Money', 'Alipay', 'Custom Account']

  const renderAdRow = (ad: P2PAd, actionLabel: string, actionColor: string) => {
    const merchant = getMerchant(ad.merchantId)
    if (!merchant) return null

    return (
      <div 
        key={ad.id} 
        className="grid md:grid-cols-7 gap-4 md:gap-6 p-4 border border-gray-200 rounded-lg hover:border-blue-400 transition-colors hover:shadow-md cursor-pointer"
        onClick={() => handleAdClick(ad)}
      >
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Merchant</p>
          <button 
            onClick={(e) => {
              e.stopPropagation()
              handleMerchantClick(merchant.id)
            }}
            className="font-medium text-foreground hover:text-blue-600 text-left flex items-center gap-1"
          >
            {merchant.name}
            {merchant.verifiedBadge && (
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            )}
          </button>
          <p className="text-xs text-gray-600">{merchant.totalTrades} trades</p>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="w-3 h-3" />
            {merchant.country}
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Price</p>
          <p className="text-lg font-semibold text-foreground">{ad.price.toLocaleString()} {ad.fiatCurrency}</p>
          <p className="text-xs text-gray-600">{ad.cryptoCurrency}/{ad.fiatCurrency}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Available</p>
          <p className="text-sm text-foreground">{ad.available.toLocaleString()} {ad.cryptoCurrency}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Limits</p>
          <p className="text-sm text-foreground">{ad.minLimit.toLocaleString()} - {ad.maxLimit.toLocaleString()}</p>
          <p className="text-xs text-gray-600">{ad.fiatCurrency}</p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Payment</p>
          <div className="flex flex-wrap gap-1">
            {ad.paymentMethods.map((method) => (
              <span key={method} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                {method}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            {ad.paymentWindow} mins
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-gray-600 mb-1 md:hidden">Rating</p>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{merchant.rating}%</span>
          </div>
          <p className="text-xs text-gray-600">{merchant.completionRate}% completion</p>
        </div>
        
        <div>
          <Button 
            onClick={(e) => {
              e.stopPropagation()
              handleAdClick(ad)
            }}
            className={cn("w-full", actionColor)}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">P2P Marketplace</h1>
          <p className="text-gray-600">Trade crypto with verified merchants</p>
        </div>
        
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Escrow Protected</p>
            <p className="text-xs text-blue-700">All trades secured by Finstack</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buy' | 'sell')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="buy" className="text-base">
            <span className="mr-2">💰</span> Buy Crypto
          </TabsTrigger>
          <TabsTrigger value="sell" className="text-base">
            <span className="mr-2">💸</span> Sell Crypto
          </TabsTrigger>
        </TabsList>

        {/* Filters Card */}
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="verified-only"
                  checked={verifiedOnly}
                  onCheckedChange={setVerifiedOnly}
                />
                <Label htmlFor="verified-only" className="text-sm cursor-pointer">
                  Verified Merchants Only
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              <Select value={filterPair} onValueChange={setFilterPair}>
                <SelectTrigger>
                  <SelectValue placeholder="All Pairs" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Pairs</SelectItem>
                  {uniquePairs.map(pair => (
                    <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="Payment Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {paymentMethods.map(method => (
                    <SelectItem key={method} value={method}>{method}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterCountry} onValueChange={setFilterCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="h-10"
              />
              
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="h-10"
              />
              
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Best Price</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <TabsContent value="buy" className="space-y-4 mt-6">
          <Card className="shadow-lg border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Buy Crypto from Merchants
                </h3>
                <span className="text-sm text-gray-600">
                  {buyAds.length} {buyAds.length === 1 ? 'offer' : 'offers'} available
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Header for desktop */}
                <div className="hidden md:grid md:grid-cols-7 gap-6 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div>Merchant</div>
                  <div>Price</div>
                  <div>Available</div>
                  <div>Limits</div>
                  <div>Payment</div>
                  <div>Rating</div>
                  <div>Action</div>
                </div>
                
                {buyAds.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">No merchants match your filters</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterPair('all')
                        setFilterPayment('all')
                        setFilterCountry('all')
                        setMinPrice('')
                        setMaxPrice('')
                        setVerifiedOnly(false)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  buyAds.map(ad => renderAdRow(ad, 'Buy', 'bg-green-600 hover:bg-green-700 text-white'))
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4 mt-6">
          <Card className="shadow-lg border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">
                  Sell Crypto to Merchants
                </h3>
                <span className="text-sm text-gray-600">
                  {sellAds.length} {sellAds.length === 1 ? 'offer' : 'offers'} available
                </span>
              </div>
              
              <div className="space-y-4">
                {/* Header for desktop */}
                <div className="hidden md:grid md:grid-cols-7 gap-6 p-4 bg-gray-50 rounded-lg font-medium text-sm text-gray-700">
                  <div>Merchant</div>
                  <div>Price</div>
                  <div>Available</div>
                  <div>Limits</div>
                  <div>Payment</div>
                  <div>Rating</div>
                  <div>Action</div>
                </div>
                
                {sellAds.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 mb-2">No merchants match your filters</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setFilterPair('all')
                        setFilterPayment('all')
                        setFilterCountry('all')
                        setMinPrice('')
                        setMaxPrice('')
                        setVerifiedOnly(false)
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  sellAds.map(ad => renderAdRow(ad, 'Sell', 'bg-red-600 hover:bg-red-700 text-white'))
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedMerchant && (
        <TraderProfileModal
          trader={mockMerchants[selectedMerchant]}
          ads={mockP2PAds.filter(ad => ad.merchantId === selectedMerchant)}
          open={showMerchantModal}
          onClose={() => {
            setShowMerchantModal(false)
            setSelectedMerchant(null)
          }}
          onSelectAd={handleAdClick}
        />
      )}

      {selectedAd && (
        <OrderModal
          ad={selectedAd}
          trader={getMerchant(selectedAd.merchantId)!}
          open={showOrderModal}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedAd(null)
          }}
          onOrderCreated={handleOrderCreated}
        />
      )}
    </div>
  )
}
