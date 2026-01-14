import { WalletCard } from "@/components/dashboard/wallet-card"
import { getWallets } from "@/lib/server/wallets"

export default async function WalletsPage() {
  const wallets = await getWallets()

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 space-y-6">
      <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-2">My Wallets</h1>
         <p className="text-sm md:text-base text-gray-600">Manage your NGN, USDT, USDC, and CNGN wallets</p>
      </div>

      <div className="flex flex-col sm:grid sm:grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {wallets.map((wallet) => (
          <WalletCard key={wallet.type} wallet={wallet} />
        ))}
      </div>
    </div>
  )
}
