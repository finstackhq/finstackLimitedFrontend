"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { convertCurrency } from "@/lib/mock-api"
import type { Wallet } from "@/lib/mock-api"
import { TrendingUp, Eye, EyeOff, WalletIcon } from "lucide-react"

interface WalletBalanceCardProps {
  wallets: Wallet[]
}

export function WalletBalanceCard({ wallets }: WalletBalanceCardProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<"NGN" | "USD">("NGN")
  const [totalBalance, setTotalBalance] = useState(0)
  const [showBalance, setShowBalance] = useState(true)

  const ngnWallet = wallets.find((w) => w.type === "NGN")
  const usdtWallet = wallets.find((w) => w.type === "USDT")

  useEffect(() => {
    let total = 0
    if (ngnWallet) {
      if (selectedCurrency === "NGN") {
        total += ngnWallet.balance
      } else if (selectedCurrency === "USD") {
        total += convertCurrency(ngnWallet.balance, "NGN", "USD")
      }
    }
    if (usdtWallet) {
      if (selectedCurrency === "NGN") {
        total += convertCurrency(usdtWallet.balance, "USDT", "NGN")
      } else if (selectedCurrency === "USD") {
        total += usdtWallet.balance
      }
    }
    setTotalBalance(total)
  }, [selectedCurrency, ngnWallet, usdtWallet])

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case "NGN":
        return "₦"
      case "USD":
        return "$"
    }
  }

  return (
    <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full blur-3xl" />

      <div className="relative p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <WalletIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs md:text-sm text-blue-100 font-medium">Total Balance</p>
              <p className="text-[10px] md:text-xs text-blue-200/70">All Wallets Combined</p>
            </div>
          </div>

          <button
            onClick={() => setShowBalance(!showBalance)}
            className="w-9 h-9 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all flex items-center justify-center"
          >
            {showBalance ? <Eye className="w-4 h-4 text-white" /> : <EyeOff className="w-4 h-4 text-white" />}
          </button>
        </div>

        <div className="py-4 md:py-6">
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              {showBalance ? (
                <>
                  {getCurrencySymbol()}
                  {totalBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </>
              ) : (
                "••••••"
              )}
            </p>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 backdrop-blur-sm">
              <TrendingUp className="w-3 h-3 text-green-300" />
              <span className="text-xs font-medium text-green-300">+12.5%</span>
            </div>
          </div>
          <p className="text-xs md:text-sm text-blue-200/70">vs last month</p>
        </div>

        <div className="flex gap-2">
          {(["NGN", "USD"] as const).map((currency) => (
            <Button
              key={currency}
              size="sm"
              variant="ghost"
              onClick={() => setSelectedCurrency(currency)}
              className={`rounded-full px-4 py-1.5 text-xs md:text-sm font-medium transition-all ${
                selectedCurrency === currency
                  ? "bg-white text-blue-700 hover:bg-white/90"
                  : "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
              }`}
            >
              {currency}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 border-t border-white/10">
          <div className="p-3 md:p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-green-300">₦</span>
              </div>
              <p className="text-[10px] md:text-xs text-blue-100 font-medium">NGN Wallet</p>
            </div>
            <p className="text-base md:text-lg lg:text-xl font-bold text-white">
              {showBalance ? `₦${ngnWallet?.balance.toLocaleString() || "0"}` : "••••••"}
            </p>
          </div>

          <div className="p-3 md:p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-300">$</span>
              </div>
              <p className="text-[10px] md:text-xs text-blue-100 font-medium">USDT Wallet</p>
            </div>
            <p className="text-base md:text-lg lg:text-xl font-bold text-white">
              {showBalance ? `$${usdtWallet?.balance.toLocaleString() || "0"}` : "••••••"}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
