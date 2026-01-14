"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Wallet,
  Receipt,
  Settings,
  Menu,
  X,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const dockItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Wallets", href: "/dashboard/wallets", icon: Wallet },
  { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const menuItems = [
  { name: "Deposit", href: "/dashboard/deposit", icon: ArrowDownToLine },
  { name: "Withdraw", href: "/dashboard/withdraw", icon: ArrowUpFromLine },
  { name: "P2P", href: "/dashboard/p2p", icon: Users },
  { name: "Merchant", href: "/dashboard/merchant", icon: Users },
  { name: "Help & Support", href: "/dashboard/help", icon: HelpCircle },
]

export function MobileDock() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <>
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-md">
        <div className="glass border border-white/20 rounded-[28px] px-1.5 py-2 shadow-2xl shadow-black/10">
          <div className="flex items-center justify-around gap-0.5">
            {dockItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[20px] transition-all duration-300 min-w-[60px]",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105"
                      : "text-gray-600 active:scale-95",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[8px] font-medium">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsMenuOpen(true)}
        className="lg:hidden fixed top-4 right-4 z-50 w-10 h-10 glass border border-white/20 rounded-full flex items-center justify-center shadow-lg shadow-black/5 active:scale-95 transition-transform"
      >
        <Menu className="w-4 h-4 text-gray-700" />
      </button>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-60 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />

          <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-blue flex items-center justify-center">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <span className="text-lg font-semibold">Finstack</span>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-95"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-all active:scale-98 group"
                    >
                      <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
                        {item.name}
                      </span>
                    </Link>
                  )
                })}
              </nav>

              <div className="p-4 border-t border-gray-100">
                <button
                  className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 transition-all active:scale-98 group w-full"
                onClick={async () => {
                  try {
                    await fetch("/api/fstack/logout", { method: "POST" })
                  } catch (e) {}
                  router.push("/login")
                }}
                >
                  <LogOut className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-600">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
