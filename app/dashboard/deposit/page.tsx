"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Stepper } from "@/components/dashboard/stepper"
import { Copy, Check, ArrowLeft, Wallet, Loader2, Banknote, Bitcoin } from "lucide-react"

// Wallet data from getWallet endpoint
interface WalletInfo {
  _id: string
  currency: string
  accountName: string
  accountNumber: string | null
  bankName: string | null
  walletAddress?: string
}

interface DepositData {
  success: boolean
  address: string
  currency: string
  network: string
  provider: string
  message: string
}

export default function DepositPage() {
  // Step 0: Choose deposit method (crypto/naira)
  // Step 1: Select wallet (USDC/CNGN) - only for crypto
  // Step 2: Deposit details (crypto address or bank details)
  const [currentStep, setCurrentStep] = useState(0)
  const [depositMethod, setDepositMethod] = useState<"crypto" | "naira" | null>(null)
  const [selectedWallet, setSelectedWallet] = useState<"USDC" | "CNGN" | null>(null)
  const [copiedText, setCopiedText] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [walletLoading, setWalletLoading] = useState(true)
  const [depositData, setDepositData] = useState<DepositData | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Wallet data from getWallet API
  const [wallets, setWallets] = useState<WalletInfo[]>([])
  const [ngnWallet, setNgnWallet] = useState<WalletInfo | null>(null)
  const [nairaAvailable, setNairaAvailable] = useState(false)

  // Fetch wallet data on mount
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const res = await fetch('/api/fstack/deposit?type=wallet')
        const data = await res.json()
        
        if (data.success && Array.isArray(data.wallets)) {
          setWallets(data.wallets)
          // Find NGN wallet to check if bank account exists
          const ngn = data.wallets.find((w: WalletInfo) => w.currency === 'NGN')
          setNgnWallet(ngn || null)
          // Naira deposit is only available if accountNumber exists
          setNairaAvailable(!!ngn?.accountNumber)
        }
      } catch (err) {
        console.error('Failed to fetch wallet data:', err)
      } finally {
        setWalletLoading(false)
      }
    }
    
    fetchWalletData()
  }, [])

  // Dynamic steps based on deposit method
  const getSteps = () => {
    if (depositMethod === 'naira') {
      return [
        { number: 1, title: "Choose Method" },
        { number: 2, title: "Bank Details" },
      ]
    }
    return [
      { number: 1, title: "Choose Method" },
      { number: 2, title: "Select Wallet" },
      { number: 3, title: "Deposit Details" },
    ]
  }

  const getDisplayStep = () => {
    if (depositMethod === 'naira') {
      return currentStep === 0 ? 1 : 2
    }
    return currentStep + 1
  }

  const handleMethodSelect = (method: "crypto" | "naira") => {
    if (method === 'naira' && !nairaAvailable) return
    setDepositMethod(method)
    
    if (method === 'naira') {
      // Skip wallet selection, go directly to bank details
      setCurrentStep(2)
    } else {
      // Go to wallet selection
      setCurrentStep(1)
    }
  }

  const handleCryptoDeposit = async () => {
    if (!selectedWallet) return
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/fstack/deposit?currency=${selectedWallet}`)
      const data = await res.json()
      
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to fetch deposit address')
      }
      
      setDepositData(data)
      setCurrentStep(2)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deposit address')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedText(true)
      setTimeout(() => setCopiedText(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  const handleBack = () => {
    if (currentStep === 0) {
      window.history.back()
    } else if (currentStep === 1) {
      setCurrentStep(0)
      setDepositMethod(null)
      setSelectedWallet(null)
    } else if (currentStep === 2) {
      if (depositMethod === 'naira') {
        setCurrentStep(0)
        setDepositMethod(null)
      } else {
        setCurrentStep(1)
        setDepositData(null)
        setAcknowledged(false)
      }
    }
  }

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F67FA]" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Deposit Funds</h1>
          <p className="text-gray-600">Add money to your wallet</p>
        </div>
      </div>

      <Stepper steps={getSteps()} currentStep={getDisplayStep()} />

      <Card className="max-w-2xl mx-auto p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Step 0: Choose Deposit Method */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Choose Deposit Method</h2>
              <p className="text-gray-600">Select how you want to deposit funds</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Deposit with Crypto */}
              <button
                onClick={() => handleMethodSelect("crypto")}
                className="p-6 border-2 rounded-lg transition-all duration-200 text-left group border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white">
                    <Bitcoin className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Deposit with Crypto</h3>
                <p className="text-sm text-gray-600">Deposit USDC or CNGN to your wallet</p>
              </button>

              {/* Deposit with Naira */}
              <button
                onClick={() => handleMethodSelect("naira")}
                disabled={!nairaAvailable}
                className={`p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
                  nairaAvailable
                    ? "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
                    : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    nairaAvailable
                      ? "bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Deposit with Naira</h3>
                <p className="text-sm text-gray-600">
                  {nairaAvailable 
                    ? "Bank transfer to your virtual account" 
                    : "Virtual account not available"}
                </p>
              </button>
            </div>

            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}

        {/* Step 1: Select Wallet (Crypto only) */}
        {currentStep === 1 && depositMethod === 'crypto' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Select Wallet</h2>
              <p className="text-gray-600">Choose the wallet you want to deposit funds into</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedWallet("USDC")}
                className={`p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
                  selectedWallet === "USDC" 
                    ? "border-[#2F67FA] bg-[#2F67FA]/5" 
                    : "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedWallet === "USDC"
                      ? "bg-[#2F67FA] text-white"
                      : "bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white"
                  }`}>
                    <span className="text-2xl font-bold">$</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">USDC Wallet</h3>
                <p className="text-sm text-gray-600">Deposit USD Coin</p>
              </button>

              <button
                onClick={() => setSelectedWallet("CNGN")}
                className={`p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
                  selectedWallet === "CNGN" 
                    ? "border-[#2F67FA] bg-[#2F67FA]/5" 
                    : "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    selectedWallet === "CNGN"
                      ? "bg-[#2F67FA] text-white"
                      : "bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white"
                  }`}>
                    <span className="text-2xl font-bold">₦</span>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">CNGN Wallet</h3>
                <p className="text-sm text-gray-600">Deposit Crypto Naira</p>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            {selectedWallet && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <Button
                  onClick={handleCryptoDeposit}
                  disabled={loading}
                  className="w-full bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching Address...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            )}
            
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}

        {/* Step 2: Deposit Details - Crypto */}
        {currentStep === 2 && depositMethod === 'crypto' && depositData && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#2F67FA]/10 flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-[#2F67FA]" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {depositData.currency} Wallet Address
              </h2>
              <p className="text-gray-600">
                Send {depositData.currency} to this wallet address ({depositData.network} Network)
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Network</Label>
                    <p className="text-lg font-semibold text-foreground">{depositData.network}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Provider</Label>
                    <p className="text-sm font-medium text-foreground">{depositData.provider}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Wallet Address</Label>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mt-1">
                      <span className="text-sm font-mono font-semibold text-foreground break-all">
                        {depositData.address}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(depositData.address)}
                        className="text-[#2F67FA] hover:bg-[#2F67FA]/10 ml-2 flex-shrink-0"
                      >
                        {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <div className="mt-3">
                      <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
                        {showQR ? 'Hide QR Code' : 'Show QR Code'}
                      </Button>
                      {showQR && (
                        <div className="mt-3 p-3 bg-white border rounded-md inline-block">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(depositData.address)}`}
                            alt="Deposit address QR"
                            className="w-[180px] h-[180px]"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-yellow-800 mb-1">Important Notes</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• Only send {depositData.currency} on {depositData.network} network</li>
                      <li>• Do not send other cryptocurrencies to this address</li>
                      <li>• Minimum deposit: 10 {depositData.currency}</li>
                      <li>• {depositData.message}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600">
                <input 
                  type="checkbox" 
                  checked={acknowledged} 
                  onChange={e => setAcknowledged(e.target.checked)} 
                />
                I will only send {depositData.currency} on {depositData.network} network.
              </label>
              <div className="flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button 
                  asChild 
                  disabled={!acknowledged} 
                  className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <a href="/dashboard">Go to Dashboard</a>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Deposit Details - Naira (Bank Transfer) */}
        {currentStep === 2 && depositMethod === 'naira' && ngnWallet && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Banknote className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Bank Transfer Details
              </h2>
              <p className="text-gray-600">
                Transfer Naira to this account to fund your wallet
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
                    <p className="text-lg font-semibold text-foreground">{ngnWallet.bankName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Account Name</Label>
                    <p className="text-sm font-medium text-foreground">{ngnWallet.accountName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Account Number</Label>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mt-1">
                      <span className="text-lg font-mono font-bold text-foreground tracking-wider">
                        {ngnWallet.accountNumber}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(ngnWallet.accountNumber || '')}
                        className="text-green-600 hover:bg-green-50 ml-2 flex-shrink-0"
                      >
                        {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">i</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-blue-800 mb-1">How it works</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Transfer any amount to this account from your bank</li>
                      <li>• Your wallet will be credited automatically</li>
                      <li>• Processing time: Usually within minutes</li>
                      <li>• Use this account only for yourself</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <Button 
                asChild 
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                <a href="/dashboard">Go to Dashboard</a>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
