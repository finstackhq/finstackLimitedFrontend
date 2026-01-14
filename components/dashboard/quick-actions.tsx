"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowDownToLine, ArrowUpFromLine, Users } from "lucide-react"

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-sm md:text-base font-semibold"
      >
        <Link href="/dashboard/deposit" className="flex items-center gap-2.5">
          <ArrowDownToLine className="w-5 h-5" />
          Deposit
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-sm md:text-base font-semibold"
      >
        <Link href="/dashboard/withdraw" className="flex items-center gap-2.5">
          <ArrowUpFromLine className="w-5 h-5" />
          Withdraw
        </Link>
      </Button>
      <Button
        asChild
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-6 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl shadow-lg text-sm md:text-base font-semibold"
      >
        <Link href="/dashboard/p2p" className="flex items-center gap-2.5">
          <Users className="w-5 h-5" />
          P2P
        </Link>
      </Button>
    </div>
  )
}
