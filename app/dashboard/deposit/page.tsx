// "use client"

// import { useState, useEffect } from "react"
// import { Card } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Label } from "@/components/ui/label"
// import { Stepper } from "@/components/dashboard/stepper"
// import { Copy, Check, ArrowLeft, Wallet, Loader2, Banknote, Bitcoin } from "lucide-react"

// // Wallet data from getWallet endpoint
// interface WalletInfo {
//   _id: string
//   currency: string
//   accountName: string
//   accountNumber: string | null
//   bankName: string | null
//   walletAddress?: string
// }

// interface DepositData {
//   success: boolean
//   address: string
//   currency: string
//   network: string
//   provider: string
//   message: string
// }

// export default function DepositPage() {
//   // Step 0: Choose deposit method (crypto/naira)
//   // Step 1: Select wallet (USDC/CNGN) - only for crypto
//   // Step 2: Deposit details (crypto address or bank details)
//   const [currentStep, setCurrentStep] = useState(0)
//   const [depositMethod, setDepositMethod] = useState<"crypto" | "naira" | null>(null)
//   const [selectedWallet, setSelectedWallet] = useState<"USDC" | "CNGN" | null>(null)
//   const [copiedText, setCopiedText] = useState(false)
//   const [showQR, setShowQR] = useState(false)
//   const [acknowledged, setAcknowledged] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [walletLoading, setWalletLoading] = useState(true)
//   const [depositData, setDepositData] = useState<DepositData | null>(null)
//   const [error, setError] = useState<string | null>(null)

//   // Wallet data from getWallet API
//   const [wallets, setWallets] = useState<WalletInfo[]>([])
//   const [ngnWallet, setNgnWallet] = useState<WalletInfo | null>(null)
//   const [nairaAvailable, setNairaAvailable] = useState(false)

//   // Fetch wallet data on mount
//   useEffect(() => {
//     const fetchWalletData = async () => {
//       try {
//         const res = await fetch('/api/fstack/deposit?type=wallet')
//         const data = await res.json()

//         if (data.success && Array.isArray(data.wallets)) {
//           setWallets(data.wallets)
//           // Find NGN wallet to check if bank account exists
//           const ngn = data.wallets.find((w: WalletInfo) => w.currency === 'NGN')
//           setNgnWallet(ngn || null)
//           // Naira deposit is only available if accountNumber exists
//           setNairaAvailable(!!ngn?.accountNumber)
//         }
//       } catch (err) {
//         console.error('Failed to fetch wallet data:', err)
//       } finally {
//         setWalletLoading(false)
//       }
//     }

//     fetchWalletData()
//   }, [])

//   // Dynamic steps based on deposit method
//   const getSteps = () => {
//     if (depositMethod === 'naira') {
//       return [
//         { number: 1, title: "Choose Method" },
//         { number: 2, title: "Bank Details" },
//       ]
//     }
//     return [
//       { number: 1, title: "Choose Method" },
//       { number: 2, title: "Select Wallet" },
//       { number: 3, title: "Deposit Details" },
//     ]
//   }

//   const getDisplayStep = () => {
//     if (depositMethod === 'naira') {
//       return currentStep === 0 ? 1 : 2
//     }
//     return currentStep + 1
//   }

//   const handleMethodSelect = (method: "crypto" | "naira") => {
//     if (method === 'naira' && !nairaAvailable) return
//     setDepositMethod(method)

//     if (method === 'naira') {
//       // Skip wallet selection, go directly to bank details
//       setCurrentStep(2)
//     } else {
//       // Go to wallet selection
//       setCurrentStep(1)
//     }
//   }

//   const handleCryptoDeposit = async () => {
//     if (!selectedWallet) return

//     setLoading(true)
//     setError(null)

//     try {
//       const res = await fetch(`/api/fstack/deposit?currency=${selectedWallet}`)
//       const data = await res.json()

//       if (!res.ok || !data.success) {
//         throw new Error(data.error || data.message || 'Failed to fetch deposit address')
//       }

//       setDepositData(data)
//       setCurrentStep(2)
//     } catch (err: any) {
//       setError(err.message || 'Failed to fetch deposit address')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const copyToClipboard = async (text: string) => {
//     try {
//       await navigator.clipboard.writeText(text)
//       setCopiedText(true)
//       setTimeout(() => setCopiedText(false), 2000)
//     } catch (err) {
//       console.error('Failed to copy: ', err)
//     }
//   }

//   const handleBack = () => {
//     if (currentStep === 0) {
//       window.history.back()
//     } else if (currentStep === 1) {
//       setCurrentStep(0)
//       setDepositMethod(null)
//       setSelectedWallet(null)
//     } else if (currentStep === 2) {
//       if (depositMethod === 'naira') {
//         setCurrentStep(0)
//         setDepositMethod(null)
//       } else {
//         setCurrentStep(1)
//         setDepositData(null)
//         setAcknowledged(false)
//       }
//     }
//   }

//   if (walletLoading) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="w-8 h-8 animate-spin text-[#2F67FA]" />
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
//         <div>
//           <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Deposit Funds</h1>
//           <p className="text-gray-600">Add money to your wallet</p>
//         </div>
//       </div>

//       <Stepper steps={getSteps()} currentStep={getDisplayStep()} />

//       <Card className="max-w-2xl mx-auto p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
//         {/* Step 0: Choose Deposit Method */}
//         {currentStep === 0 && (
//           <div className="space-y-6">
//             <div>
//               <h2 className="text-xl font-semibold text-foreground mb-2">Choose Deposit Method</h2>
//               <p className="text-gray-600">Select how you want to deposit funds</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               {/* Deposit with Crypto */}
//               <button
//                 onClick={() => handleMethodSelect("crypto")}
//                 className="p-6 border-2 rounded-lg transition-all duration-200 text-left group border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white">
//                     <Bitcoin className="w-6 h-6" />
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-semibold text-foreground mb-1">Deposit with Crypto</h3>
//                 <p className="text-sm text-gray-600">Deposit USDC or CNGN to your wallet</p>
//               </button>

//               {/* Deposit with Naira */}
//               <button
//                 onClick={() => handleMethodSelect("naira")}
//                 disabled={!nairaAvailable}
//                 className={`p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
//                   nairaAvailable
//                     ? "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
//                     : "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
//                 }`}
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
//                     nairaAvailable
//                       ? "bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white"
//                       : "bg-gray-100 text-gray-400"
//                   }`}>
//                     <Banknote className="w-6 h-6" />
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-semibold text-foreground mb-1">Deposit with Naira</h3>
//                 <p className="text-sm text-gray-600">
//                   {nairaAvailable
//                     ? "Bank transfer to your virtual account"
//                     : "Virtual account not available"}
//                 </p>
//               </button>
//             </div>

//             <Button
//               onClick={handleBack}
//               variant="outline"
//               className="w-full flex items-center justify-center gap-2"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back
//             </Button>
//           </div>
//         )}

//         {/* Step 1: Select Wallet (Crypto only) */}
//         {currentStep === 1 && depositMethod === 'crypto' && (
//           <div className="space-y-6">
//             <div>
//               <h2 className="text-xl font-semibold text-foreground mb-2">Select Wallet</h2>
//               <p className="text-gray-600">Choose the wallet you want to deposit funds into</p>
//             </div>

//             <div className="grid md:grid-cols-2 gap-4">
//               <button
//                 onClick={() => setSelectedWallet("USDC")}
//                 className={`p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
//                   selectedWallet === "USDC"
//                     ? "border-[#2F67FA] bg-[#2F67FA]/5"
//                     : "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
//                 }`}
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
//                     selectedWallet === "USDC"
//                       ? "bg-[#2F67FA] text-white"
//                       : "bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white"
//                   }`}>
//                     <span className="text-2xl font-bold">$</span>
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-semibold text-foreground mb-1">USDC Wallet</h3>
//                 <p className="text-sm text-gray-600">Deposit USD Coin</p>
//               </button>

//               <button
//                 onClick={() => setSelectedWallet("CNGN")}
//                 className={`p-6 border-2 rounded-lg transition-all duration-200 text-left group ${
//                   selectedWallet === "CNGN"
//                     ? "border-[#2F67FA] bg-[#2F67FA]/5"
//                     : "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
//                 }`}
//               >
//                 <div className="flex items-center justify-between mb-4">
//                   <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
//                     selectedWallet === "CNGN"
//                       ? "bg-[#2F67FA] text-white"
//                       : "bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white"
//                   }`}>
//                     <span className="text-2xl font-bold">₦</span>
//                   </div>
//                 </div>
//                 <h3 className="text-lg font-semibold text-foreground mb-1">CNGN Wallet</h3>
//                 <p className="text-sm text-gray-600">Deposit Crypto Naira</p>
//               </button>
//             </div>

//             {error && (
//               <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
//                 {error}
//               </div>
//             )}

//             {selectedWallet && (
//               <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
//                 <Button
//                   onClick={handleCryptoDeposit}
//                   disabled={loading}
//                   className="w-full bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
//                 >
//                   {loading ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Fetching Address...
//                     </>
//                   ) : (
//                     'Continue'
//                   )}
//                 </Button>
//               </div>
//             )}

//             <Button
//               onClick={handleBack}
//               variant="outline"
//               className="w-full flex items-center justify-center gap-2"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               Back
//             </Button>
//           </div>
//         )}

//         {/* Step 2: Deposit Details - Crypto */}
//         {currentStep === 2 && depositMethod === 'crypto' && depositData && (
//           <div className="space-y-6">
//             <div className="text-center">
//               <div className="w-16 h-16 rounded-full bg-[#2F67FA]/10 flex items-center justify-center mx-auto mb-4">
//                 <Wallet className="w-8 h-8 text-[#2F67FA]" />
//               </div>
//               <h2 className="text-xl font-semibold text-foreground mb-2">
//                 {depositData.currency} Wallet Address
//               </h2>
//               <p className="text-gray-600">
//                 Send {depositData.currency} to this wallet address ({depositData.network} Network)
//               </p>
//             </div>

//             <div className="space-y-4">
//               <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
//                 <div className="space-y-4">
//                   <div>
//                     <Label className="text-sm font-medium text-gray-600">Network</Label>
//                     <p className="text-lg font-semibold text-foreground">{depositData.network}</p>
//                   </div>
//                   <div>
//                     <Label className="text-sm font-medium text-gray-600">Provider</Label>
//                     <p className="text-sm font-medium text-foreground">FINSTACK</p>
//                   </div>
//                   <div>
//                     <Label className="text-sm font-medium text-gray-600">Wallet Address</Label>
//                     <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mt-1">
//                       <span className="text-sm font-mono font-semibold text-foreground break-all">
//                         {depositData.address}
//                       </span>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => copyToClipboard(depositData.address)}
//                         className="text-[#2F67FA] hover:bg-[#2F67FA]/10 ml-2 flex-shrink-0"
//                       >
//                         {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
//                       </Button>
//                     </div>
//                     <div className="mt-3">
//                       <Button variant="outline" size="sm" onClick={() => setShowQR(!showQR)}>
//                         {showQR ? 'Hide QR Code' : 'Show QR Code'}
//                       </Button>
//                       {showQR && (
//                         <div className="mt-3 p-3 bg-white border rounded-md inline-block">
//                           <img
//                             src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(depositData.address)}`}
//                             alt="Deposit address QR"
//                             className="w-[180px] h-[180px]"
//                           />
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                 <div className="flex items-start gap-3">
//                   <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-white text-xs font-bold">!</span>
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-yellow-800 mb-1">Important Notes</h4>
//                     <ul className="text-sm text-yellow-700 space-y-1">
//                       <li>• Only send {depositData.currency} on {depositData.network} network</li>
//                       <li>• Do not send other cryptocurrencies to this address</li>
//                       <li>• Minimum deposit: 10 {depositData.currency}</li>
//                       <li>• {depositData.message}</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-col gap-3">
//               <label className="flex items-center gap-2 text-xs text-gray-600">
//                 <input
//                   type="checkbox"
//                   checked={acknowledged}
//                   onChange={e => setAcknowledged(e.target.checked)}
//                 />
//                 I will only send {depositData.currency} on {depositData.network} network.
//               </label>
//               <div className="flex gap-3">
//                 <Button
//                   onClick={handleBack}
//                   variant="outline"
//                   className="flex-1 flex items-center justify-center gap-2"
//                 >
//                   <ArrowLeft className="w-4 h-4" />
//                   Back
//                 </Button>
//                 <Button
//                   asChild
//                   disabled={!acknowledged}
//                   className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <a href="/dashboard">Go to Dashboard</a>
//                 </Button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Step 2: Deposit Details - Naira (Bank Transfer) */}
//         {currentStep === 2 && depositMethod === 'naira' && ngnWallet && (
//           <div className="space-y-6">
//             <div className="text-center">
//               <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
//                 <Banknote className="w-8 h-8 text-green-600" />
//               </div>
//               <h2 className="text-xl font-semibold text-foreground mb-2">
//                 Bank Transfer Details
//               </h2>
//               <p className="text-gray-600">
//                 Transfer Naira to this account to fund your wallet
//               </p>
//             </div>

//             <div className="space-y-4">
//               <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
//                 <div className="space-y-4">
//                   <div>
//                     <Label className="text-sm font-medium text-gray-600">Bank Name</Label>
//                     <p className="text-lg font-semibold text-foreground">{ngnWallet.bankName}</p>
//                   </div>
//                   <div>
//                     <Label className="text-sm font-medium text-gray-600">Account Name</Label>
//                     <p className="text-sm font-medium text-foreground uppercase">{ngnWallet.accountName}</p>
//                   </div>
//                   <div>
//                     <Label className="text-sm font-medium text-gray-600">Account Number</Label>
//                     <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 mt-1">
//                       <span className="text-lg font-mono font-bold text-foreground tracking-wider">
//                         {ngnWallet.accountNumber}
//                       </span>
//                       <Button
//                         variant="ghost"
//                         size="sm"
//                         onClick={() => copyToClipboard(ngnWallet.accountNumber || '')}
//                         className="text-green-600 hover:bg-green-50 ml-2 flex-shrink-0"
//                       >
//                         {copiedText ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//                 <div className="flex items-start gap-3">
//                   <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
//                     <span className="text-white text-xs font-bold">i</span>
//                   </div>
//                   <div>
//                     <h4 className="font-medium text-blue-800 mb-1">How it works</h4>
//                     <ul className="text-sm text-blue-700 space-y-1">
//                       <li>• Transfer any amount to this account from your bank</li>
//                       <li>• Your wallet will be credited automatically</li>
//                       <li>• Processing time: Usually within minutes</li>
//                       <li>• Use this account only for yourself</li>
//                     </ul>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex gap-3">
//               <Button
//                 onClick={handleBack}
//                 variant="outline"
//                 className="flex-1 flex items-center justify-center gap-2"
//               >
//                 <ArrowLeft className="w-4 h-4" />
//                 Back
//               </Button>
//               <Button
//                 asChild
//                 className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
//               >
//                 <a href="/dashboard">Go to Dashboard</a>
//               </Button>
//             </div>
//           </div>
//         )}
//       </Card>
//     </div>
//   )
// }

"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Stepper } from "@/components/dashboard/stepper";
import {
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Banknote,
  Bitcoin,
  AlertCircle,
  Clock,
  BadgeCheck,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WalletInfo {
  _id: string;
  currency: string;
  accountName: string;
  accountNumber: string | null;
  bankName: string | null;
  walletAddress?: string;
}

interface OnrampVirtualAccount {
  accountName: string;
  accountNumber: string;
  bankName: string;
  expiresAt?: string; // ISO string if Paycrest returns expiry
}

interface OnrampOrderResponse {
  success: boolean;
  message?: string;
  // The virtual account details the user should pay into (legacy)
  virtualAccount?: OnrampVirtualAccount;
  // Paycrest order reference for polling / display
  reference?: string;
  orderId?: string;
  // Amount info for display
  amount?: number;
  currency?: string;
  stablecoin?: string;
  // Paycrest V2 fields (flat)
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  amountToTransfer?: string;
  validUntil?: string;
}

type DepositMethod = "crypto" | "naira";
type Stablecoin = "USDC" | "CNGN";
type Step = 0 | 1 | 2 | 3;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DepositPage() {
  // ── Navigation state ──
  const [currentStep, setCurrentStep] = useState<Step>(0);
  const [depositMethod, setDepositMethod] = useState<DepositMethod | null>(
    null,
  );

  // ── Crypto deposit state ──
  const [selectedWallet, setSelectedWallet] = useState<Stablecoin | null>(null);
  const [cryptoAddress, setCryptoAddress] = useState<string | null>(null);
  const [cryptoNetwork, setCryptoNetwork] = useState<string>("");
  const [cryptoCurrency, setCryptoCurrency] = useState<string>("");
  const [cryptoMessage, setCryptoMessage] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  // ── NGN onramp state ──
  const [ngnStablecoin, setNgnStablecoin] = useState<Stablecoin | null>(null);
  const [ngnAmount, setNgnAmount] = useState<string>("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [onrampOrder, setOnrampOrder] = useState<OnrampOrderResponse | null>(
    null,
  );
  const [hasPrimaryBank, setHasPrimaryBank] = useState<boolean | null>(null);

  // ── Shared UI state ──
  const [copiedText, setCopiedText] = useState(false);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  // ── Fetch wallet info on mount ──────────────────────────────────────────────
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const res = await fetch("/api/fstack/deposit?type=wallet");
        const data = await res.json();
        if (data.success && Array.isArray(data.wallets)) {
          setWallets(data.wallets);
        }
        setHasPrimaryBank(!!data.hasPrimaryBank);
      } catch {
        // Non-blocking — continue anyway
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallets();
  }, []);

  // ─── Step helpers ──────────────────────────────────────────────────────────

  const CRYPTO_STEPS = [
    { number: 1, title: "Method" },
    { number: 2, title: "Select Wallet" },
    { number: 3, title: "Address" },
  ];

  const NGN_STEPS = [
    { number: 1, title: "Method" },
    { number: 2, title: "Amount & Coin" },
    { number: 3, title: "Pay" },
  ];

  const steps = depositMethod === "naira" ? NGN_STEPS : CRYPTO_STEPS;

  // Map internal step → displayed step number
  const displayStep = currentStep === 0 ? 1 : currentStep;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleMethodSelect = (method: DepositMethod) => {
    setDepositMethod(method);
    setError(null);
    setCurrentStep(1);
  };

  // CRYPTO: fetch deposit address then advance
  const handleCryptoDeposit = async () => {
    if (!selectedWallet) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/fstack/deposit?currency=${selectedWallet}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || data.message || "Failed to fetch deposit address",
        );
      }
      setCryptoAddress(data.address);
      setCryptoNetwork(data.network);
      setCryptoCurrency(data.currency);
      setCryptoMessage(data.message || "");
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to fetch deposit address");
    } finally {
      setLoading(false);
    }
  };

  // NGN: validate amount then call onramp initiate
  const validateAmount = (value: string): boolean => {
    const num = Number(value);
    if (!value || isNaN(num) || num <= 0) {
      setAmountError("Please enter a valid amount");
      return false;
    }
    if (num < 1000) {
      setAmountError("Minimum deposit is ₦1,000");
      return false;
    }
    setAmountError(null);
    return true;
  };

  const handleNgnInitiate = async () => {
    if (!ngnStablecoin || !validateAmount(ngnAmount)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/fstack/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(ngnAmount),
          fiatCurrency: "NGN",
          stablecoin: ngnStablecoin,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Show toast if no primary bank account error
        if (
          data.error?.toLowerCase().includes("no primary bank account") ||
          data.message?.toLowerCase().includes("no primary bank account")
        ) {
          toast({
            title: "Primary bank account required",
            description: (
              <span>
                To deposit Naira, you need a primary bank account set up for
                refunds.{" "}
                <a
                  href="/dashboard/settings?tab=payment"
                  className="underline font-medium text-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Add one now →
                </a>
              </span>
            ),
            duration: 7000,
            variant: "destructive",
          });
        }
        throw new Error(data.message || "Failed to initiate deposit");
      }
      setOnrampOrder(data.data || {});
      setCurrentStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to initiate deposit");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 0) {
      window.history.back();
    } else if (currentStep === 1) {
      setCurrentStep(0);
      setDepositMethod(null);
      setSelectedWallet(null);
      setNgnStablecoin(null);
      setNgnAmount("");
    } else if (currentStep === 2) {
      setCurrentStep(1);
      setCryptoAddress(null);
      setOnrampOrder(null);
      setAcknowledged(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch {}
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  if (walletLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#2F67FA]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
          Deposit Funds
        </h1>
        <p className="text-gray-600 mt-1">Add money to your wallet</p>
      </div>

      <Stepper steps={steps} currentStep={displayStep} />

      <Card className="max-w-2xl mx-auto p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ══ STEP 0: Choose Method ════════════════════════════════════════════ */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Choose Deposit Method
              </h2>
              <p className="text-gray-600 text-sm">
                Select how you want to deposit funds
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Crypto */}
              <button
                onClick={() => handleMethodSelect("crypto")}
                className="p-6 border-2 rounded-xl transition-all duration-200 text-left group border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-[#2F67FA]/10 group-hover:bg-[#2F67FA] text-[#2F67FA] group-hover:text-white mb-4">
                  <Bitcoin className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Deposit Crypto
                </h3>
                <p className="text-sm text-gray-500">
                  Send USDC or CNGN directly to your wallet address
                </p>
              </button>

              {/* NGN Onramp */}
              <button
                onClick={() => handleMethodSelect("naira")}
                className="p-6 border-2 rounded-xl transition-all duration-200 text-left group border-gray-200 hover:border-green-500 hover:bg-green-50"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors bg-green-100 group-hover:bg-green-600 text-green-600 group-hover:text-white mb-4">
                  <Banknote className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  Deposit with Naira
                </h3>
                <p className="text-sm text-gray-500">
                  Pay NGN via bank transfer and receive USDC or CNGN
                </p>
              </button>
            </div>

            {/* No primary bank warning — shown proactively */}
            {hasPrimaryBank === false && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Primary bank account required
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    To deposit Naira, you need a primary bank account set up for
                    refunds.{" "}
                    <a
                      href="/dashboard/settings?tab=payment"
                      className="underline font-medium"
                    >
                      Add one now →
                    </a>
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </div>
        )}

        {/* ══ STEP 1 (CRYPTO): Select Wallet ══════════════════════════════════ */}
        {currentStep === 1 && depositMethod === "crypto" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Select Wallet
              </h2>
              <p className="text-gray-600 text-sm">
                Choose which asset you want to deposit
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {(["USDC", "CNGN"] as Stablecoin[]).map((coin) => (
                <button
                  key={coin}
                  onClick={() => setSelectedWallet(coin)}
                  className={`p-6 border-2 rounded-xl transition-all duration-200 text-left group ${
                    selectedWallet === coin
                      ? "border-[#2F67FA] bg-[#2F67FA]/5"
                      : "border-gray-200 hover:border-[#2F67FA] hover:bg-[#2F67FA]/5"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 font-bold text-xl transition-colors ${
                      selectedWallet === coin
                        ? "bg-[#2F67FA] text-white"
                        : "bg-[#2F67FA]/10 text-[#2F67FA] group-hover:bg-[#2F67FA] group-hover:text-white"
                    }`}
                  >
                    {coin === "USDC" ? "$" : "₦"}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {coin} Wallet
                  </h3>
                  <p className="text-sm text-gray-500">
                    {coin === "USDC" ? "USD Coin" : "Crypto Naira"}
                  </p>
                </button>
              ))}
            </div>

            {error && <ErrorBox message={error} />}

            <div className="flex flex-col gap-3">
              {selectedWallet && (
                <Button
                  onClick={handleCryptoDeposit}
                  disabled={loading}
                  className="w-full bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Fetching
                      Address…
                    </>
                  ) : (
                    <>
                      Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </Button>
              )}
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 (CRYPTO): Deposit Address ════════════════════════════════ */}
        {currentStep === 2 && depositMethod === "crypto" && cryptoAddress && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-[#2F67FA]/10 flex items-center justify-center mx-auto mb-3">
                <Bitcoin className="w-7 h-7 text-[#2F67FA]" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                {cryptoCurrency} Deposit Address
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Send {cryptoCurrency} only on{" "}
                <span className="font-semibold">{cryptoNetwork}</span> network
              </p>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
              <InfoRow label="Network" value={cryptoNetwork} />
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Address
                </Label>
                <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 mt-1">
                  <span className="text-xs font-mono text-foreground break-all flex-1">
                    {cryptoAddress}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(cryptoAddress)}
                    className="text-[#2F67FA] hover:bg-[#2F67FA]/10 flex-shrink-0"
                  >
                    {copiedText ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="mt-2 text-xs text-[#2F67FA] hover:underline"
                >
                  {showQR ? "Hide QR Code" : "Show QR Code"}
                </button>
                {showQR && (
                  <div className="mt-2 p-3 bg-white border rounded-lg inline-block">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(cryptoAddress)}`}
                      alt="QR Code"
                      className="w-40 h-40"
                    />
                  </div>
                )}
              </div>
            </div>

            <WarningBox>
              <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
                <li>
                  Only send {cryptoCurrency} on {cryptoNetwork} network
                </li>
                <li>Sending other assets may result in permanent loss</li>
                <li>Minimum deposit: 10 {cryptoCurrency}</li>
                {cryptoMessage && <li>{cryptoMessage}</li>}
              </ul>
            </WarningBox>

            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(e) => setAcknowledged(e.target.checked)}
                className="rounded"
              />
              I confirm I will only send {cryptoCurrency} on the {cryptoNetwork}{" "}
              network
            </label>

            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                asChild
                disabled={!acknowledged}
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <a href="/dashboard">Done</a>
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 1 (NGN): Amount & Stablecoin ═══════════════════════════════ */}
        {currentStep === 1 && depositMethod === "naira" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-1">
                Deposit Details
              </h2>
              <p className="text-gray-600 text-sm">
                Enter the amount and choose what you want to receive
              </p>
            </div>
            {/* Amount input */}
            <div className="space-y-1">
              <Label htmlFor="amount" className="text-sm font-medium">
                Amount (NGN)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                  ₦
                </span>
                <Input
                  id="amount"
                  type="number"
                  placeholder="e.g. 50000"
                  value={ngnAmount}
                  onChange={(e) => {
                    setNgnAmount(e.target.value);
                    if (amountError) validateAmount(e.target.value);
                  }}
                  className={`pl-8 ${amountError ? "border-red-400 focus-visible:ring-red-400" : ""}`}
                />
              </div>
              {amountError && (
                <p className="text-xs text-red-500">{amountError}</p>
              )}
              <p className="text-xs text-gray-400">Minimum deposit: ₦1,000</p>
            </div>
            {/* Stablecoin selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Receive as</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["USDC", "CNGN"] as Stablecoin[]).map((coin) => (
                  <button
                    key={coin}
                    onClick={() => setNgnStablecoin(coin)}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 text-left ${
                      ngnStablecoin === coin
                        ? "border-[#2F67FA] bg-[#2F67FA]/5"
                        : "border-gray-200 hover:border-[#2F67FA]/50"
                    }`}
                  >
                    <span
                      className={`text-lg font-bold ${ngnStablecoin === coin ? "text-[#2F67FA]" : "text-gray-600"}`}
                    >
                      {coin === "USDC" ? "$" : "₦"}
                    </span>
                    <p className="text-sm font-semibold text-foreground mt-1">
                      {coin}
                    </p>
                    <p className="text-xs text-gray-400">
                      {coin === "USDC" ? "USD Coin" : "Crypto Naira"}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            {/* Rate hint */}
            {ngnStablecoin && ngnAmount && Number(ngnAmount) >= 1000 && (
              <div className="p-3 bg-[#2F67FA]/5 border border-[#2F67FA]/20 rounded-lg">
                <p className="text-xs text-[#2F67FA] font-medium">
                  You'll receive approximately{" "}
                  <span className="font-bold">
                    {ngnStablecoin === "USDC"
                      ? `$${(Number(ngnAmount) / 1620).toFixed(2)} USDC`
                      : `${Number(ngnAmount).toLocaleString()} CNGN`}
                  </span>{" "}
                  (indicative rate, final amount set by Paycrest)
                </p>
              </div>
            )}
            {error && <ErrorBox message={error} />}
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleNgnInitiate}
                disabled={loading || !ngnStablecoin || !ngnAmount}
                className="w-full bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating
                    order…
                  </>
                ) : (
                  <>
                    Get Payment Details{" "}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
              <Button
                onClick={handleBack}
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 (NGN): Virtual Account / Pay ═════════════════════════════ */}
        {currentStep === 2 && depositMethod === "naira" && onrampOrder && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Banknote className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Transfer ₦
                {onrampOrder.amountToTransfer
                  ? Number(onrampOrder.amountToTransfer).toLocaleString()
                  : Number(ngnAmount).toLocaleString()}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Pay into this unique account to receive your{" "}
                {onrampOrder.stablecoin || ngnStablecoin}
              </p>
            </div>
            {/* Summary pill */}
            <div className="flex items-center justify-center gap-2">
              <span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">
                ₦
                {onrampOrder.amountToTransfer
                  ? Number(onrampOrder.amountToTransfer).toLocaleString()
                  : Number(ngnAmount).toLocaleString()}{" "}
                NGN
              </span>
              <span className="text-gray-400 text-xs">→</span>
              <span className="px-3 py-1 bg-[#2F67FA]/10 rounded-full text-xs font-semibold text-[#2F67FA]">
                {onrampOrder.stablecoin || ngnStablecoin}
              </span>
            </div>
            {/* Virtual account details (Paycrest V2 fallback) */}
            {onrampOrder.virtualAccount || onrampOrder.accountNumber ? (
              <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                <InfoRow
                  label="Bank Name"
                  value={
                    (onrampOrder.virtualAccount
                      ? onrampOrder.virtualAccount.bankName
                      : onrampOrder.bankName) || ""
                  }
                />
                <InfoRow
                  label="Account Name"
                  value={
                    (onrampOrder.virtualAccount
                      ? onrampOrder.virtualAccount.accountName
                      : onrampOrder.accountName) || ""
                  }
                />
                <div>
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Number
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-gray-200 mt-1">
                    <span className="text-xl font-mono font-bold text-foreground tracking-widest flex-1">
                      {onrampOrder.virtualAccount?.accountNumber ??
                        onrampOrder.accountNumber ??
                        ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          onrampOrder.virtualAccount?.accountNumber ??
                            onrampOrder.accountNumber ??
                            "",
                        )
                      }
                      className="text-green-600 hover:bg-green-50 flex-shrink-0"
                    >
                      {copiedText ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                {(onrampOrder.virtualAccount?.expiresAt ||
                  onrampOrder.validUntil) && (
                  <div className="flex items-center gap-2 text-xs text-amber-600">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      This account expires at{" "}
                      {new Date(
                        onrampOrder.virtualAccount?.expiresAt ||
                          onrampOrder.validUntil ||
                          "",
                      ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              // Fallback: backend didn't return virtual account — show reference only
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm text-amber-800 font-medium">
                  Order created. Reference:{" "}
                  <span className="font-mono font-bold">
                    {onrampOrder.reference}
                  </span>
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Please check your email or contact support for payment
                  details.
                </p>
              </div>
            )}
            {/* Important notes */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-3">
                <BadgeCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">
                    How this works
                  </h4>
                  <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                    <li>
                      Transfer exactly ₦
                      {onrampOrder.amountToTransfer
                        ? Number(onrampOrder.amountToTransfer).toLocaleString()
                        : Number(ngnAmount).toLocaleString()}{" "}
                      to the account above
                    </li>
                    <li>
                      Your {onrampOrder.stablecoin || ngnStablecoin} wallet will
                      be credited automatically
                    </li>
                    <li>
                      Use this account for this transaction only — it's unique
                      to this order
                    </li>
                    <li>
                      Processing usually takes a few minutes after payment
                    </li>
                    <li>If payment is not made, no funds will be deducted</li>
                  </ul>
                </div>
              </div>
            </div>
            {/* Reference */}
            {onrampOrder.reference && (
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-xs text-gray-500">Order Reference</span>
                <span className="text-xs font-mono font-semibold text-foreground">
                  {onrampOrder.reference}
                </span>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                onClick={handleBack}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Button
                asChild
                className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white"
              >
                <a href="/dashboard">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check Balance
                </a>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {label}
      </Label>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-700">{message}</p>
    </div>
  );
}

function WarningBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-yellow-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-white text-xs font-bold">!</span>
        </div>
        <div>
          <h4 className="text-sm font-medium text-yellow-800 mb-1">
            Important
          </h4>
          {children}
        </div>
      </div>
    </div>
  );
}
