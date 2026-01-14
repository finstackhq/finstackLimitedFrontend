"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Stepper } from "@/components/dashboard/stepper"
import { Copy, Check, ArrowLeft, Wallet, Loader2 } from "lucide-react"

const steps = [
  { number: 1, title: "Select Wallet" },
  { number: 2, title: "Deposit Details" },
]

interface DepositData {
  success: boolean
  address: string
  currency: string
  network: string
  provider: string
  message: string
}

export default function DepositPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedWallet, setSelectedWallet] = useState<"USDC" | "CNGN" | null>(null)
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, setLoading] = useState(false)
  const [depositData, setDepositData] = useState<DepositData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleContinue = async () => {
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
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    } catch (err) {
      console.error('Failed to copy: ', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Deposit Funds</h1>
          <p className="text-gray-600">Add money to your wallet</p>
        </div>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <Card className="max-w-2xl mx-auto p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Step 1: Select Wallet */}
        {currentStep === 1 && (
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
                  onClick={handleContinue}
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
            
            {/* Back button for step 1 */}
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
        )}

        {/* Step 2: Deposit Details */}
        {currentStep === 2 && depositData && (
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
                        {copiedAddress ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    {/* QR code toggle */}
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

            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-xs text-gray-600 -mt-1">
                <input 
                  type="checkbox" 
                  checked={acknowledged} 
                  onChange={e => setAcknowledged(e.target.checked)} 
                />
                I will only send {depositData.currency} on {depositData.network} network.
              </label>
              <Button
                onClick={() => {
                  setCurrentStep(1)
                  setDepositData(null)
                  setAcknowledged(false)
                }}
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
        )}
      </Card>
    </div>
  )
}
