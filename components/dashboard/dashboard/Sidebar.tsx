"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Home,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  Users,
  Receipt,
  Settings,
  HelpCircle,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Wallets", href: "/dashboard/wallets", icon: Wallet },
  { name: "Deposit", href: "/dashboard/deposit", icon: ArrowDownToLine },
  { name: "Withdraw", href: "/dashboard/withdraw", icon: ArrowUpFromLine },
  { name: "P2P", href: "/dashboard/p2p", icon: Users },
  { name: "Transactions", href: "/dashboard/transactions", icon: Receipt },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Help", href: "/dashboard/help", icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-100 z-40">
      <div className="h-16 flex items-center px-5 border-b border-gray-100 bg-white">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-white">
            <img src="/logo.png" alt="Finstack logo" className="w-8 h-8 object-contain" style={{ background: 'white' }} loading="lazy" />
          </span>
          <span className="text-xl font-semibold text-gray-900">Finstack</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
              )}
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200 text-red-600 hover:bg-red-50 group"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
