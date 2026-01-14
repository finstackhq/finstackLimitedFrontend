import type { ReactNode } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { MobileDock } from "@/components/dashboard/mobile-dock"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <MobileDock />
      <main className="lg:ml-64 min-h-screen pb-24 lg:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
