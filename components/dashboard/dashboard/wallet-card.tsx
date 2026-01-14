"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Check, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import Link from "next/link"
import type { Wallet } from "@/lib/mock-api"

interface WalletCardProps {
  wallet: Wallet
}

export function WalletCard({ wallet }: WalletCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const accountInfo = wallet.type === "NGN" ? wallet.accountNumber : wallet.walletAddress

  return (
    <Card className="p-6 shadow-lg border-gray-200 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{wallet.type} Wallet</h3>
            <p className="text-sm text-gray-600">{wallet.type === "NGN" ? "9PSB Account" : "Blockradar Wallet"}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#2F67FA]/10 flex items-center justify-center">
            <span className="text-xl font-bold text-[#2F67FA]">{wallet.type === "NGN" ? "₦" : "$"}</span>
          </div>
        </div>

        {/* Balance */}
        <div className="py-4 border-y border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-3xl font-bold text-foreground">
            {wallet.type === "NGN" ? "₦" : "$"}
            {wallet.balance.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        {/* Account Info */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">
            {wallet.type === "NGN" ? "Account Number" : "Wallet Address"}
          </p>
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm font-mono text-foreground flex-1 truncate">{accountInfo}</p>
            <button
              onClick={() => handleCopy(accountInfo || "")}
              className="p-2 hover:bg-white rounded-md transition-colors group"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600 group-hover:text-[#2F67FA]" />
              )}
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            asChild
            className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white transition-all duration-200 hover:scale-105"
          >
            <Link href="/dashboard/deposit" className="flex items-center justify-center gap-2">
              <ArrowDownToLine className="w-4 h-4" />
              Deposit
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white transition-all duration-200 hover:scale-105"
          >
            <Link href="/dashboard/withdraw" className="flex items-center justify-center gap-2">
              <ArrowUpFromLine className="w-4 h-4" />
              Withdraw
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  )
}
