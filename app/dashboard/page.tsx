"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/components/auth-form";
import { Loader2 } from "lucide-react";

// Dynamically import components to prevent SSR issues
const UserOrders = dynamic(
  () =>
    import("@/components/dashboard/user-orders").then((mod) => mod.UserOrders),
  { ssr: false },
);
const WelcomeGreeting = dynamic(
  () =>
    import("@/components/dashboard/welcome-greeting").then(
      (mod) => mod.WelcomeGreeting,
    ),
  { ssr: false },
);
const WalletBalanceCard = dynamic(
  () =>
    import("@/components/dashboard/wallet-balance-card").then(
      (mod) => mod.WalletBalanceCard,
    ),
  { ssr: false },
);
const CurrencyConverter = dynamic(
  () =>
    import("@/components/dashboard/currency-converter").then(
      (mod) => mod.CurrencyConverter,
    ),
  { ssr: false },
);
const QuickActions = dynamic(
  () =>
    import("@/components/dashboard/quick-actions").then(
      (mod) => mod.QuickActions,
    ),
  { ssr: false },
);
const RecentActivity = dynamic(
  () =>
    import("@/components/dashboard/recent-activity").then(
      (mod) => mod.RecentActivity,
    ),
  { ssr: false },
);
const MoneyQuote = dynamic(
  () =>
    import("@/components/dashboard/money-quote").then((mod) => mod.MoneyQuote),
  { ssr: false },
);
const DidYouKnow = dynamic(
  () =>
    import("@/components/dashboard/did-you-know").then((mod) => mod.DidYouKnow),
  { ssr: false },
);
const BankAccountsCard = dynamic(
  () =>
    import("@/components/dashboard/bank-accounts-card").then(
      (mod) => mod.BankAccountsCard,
    ),
  { ssr: false },
);

import { KYCPopup } from "@/components/kyc-popup";

// How often the dashboard quietly re-fetches balances while the tab is open
const REFRESH_INTERVAL_MS = 30_000;

export default function DashboardPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // UPDATED: besides the first load, the dashboard now refreshes balances
  //  - every 30 seconds
  //  - whenever the user comes back to this browser tab
  useEffect(() => {
    setMounted(true);
    fetchDashboardData();

    // Skip the timed refresh while the tab is hidden. The listener below
    // refreshes as soon as the user comes back to the tab.
    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") fetchDashboardData(true);
    }, REFRESH_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchDashboardData(true);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // UPDATED: `silent = true` skips the full-page spinner, so background
  // refreshes update the numbers without the screen flashing.
  const fetchDashboardData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      // Fetch wallets
      const walletsRes = await fetchWithAuth(
        "/api/fstack/wallet/user-balances",
        {
          cache: "no-store",
        },
      );
      // If the request failed, stop here and keep whatever is on screen.
      // Without this, an error response would look like "no wallets" and
      // every balance would flash to 0.
      if (!walletsRes.ok) {
        throw new Error(`Balances request failed with status ${walletsRes.status}`);
      }
      const walletsData = await walletsRes.json();

      // Normalize wallet data to match UI expectations (copied from lib/server/wallets.ts)
      const list: any[] = Array.isArray(walletsData?.data)
        ? walletsData.data
        : Array.isArray(walletsData?.balances)
          ? walletsData.balances
          : [];

      const byCurrency = new Map<string, any>();
      for (const item of list) {
        const raw =
          typeof item?.currency === "string" ? item.currency.trim() : "";
        const code = raw.toUpperCase(); // e.g., cNGN -> CNGN
        byCurrency.set(code, item);
      }

      const supported = ["NGN", "USDT", "USDC", "CNGN"];
      setWallets((previous) =>
        supported.map((type, idx) => {
          const entry = byCurrency.get(type);
          const before = previous.find((w) => w.type === type);

          // The backend marks a wallet it could not read with `error: true`
          // and a zero balance. That zero is not real, so keep the balance
          // that is already on screen instead of overwriting it.
          if (entry?.error && before) return before;

          const total =
            Number(entry?.balance?.total) ||
            Number(entry?.balance?.available) ||
            0;
          const address = entry?.walletAddress || entry?.address || "";
          return {
            id: String(idx + 1),
            type,
            balance: total,
            accountNumber:
              type === "NGN" ? entry?.accountNumber || "" : undefined,
            walletAddress: type !== "NGN" ? address : undefined,
          };
        }),
      );

      // Fetch recent transactions (limit to 5)
      const txnRes = await fetchWithAuth("/api/fstack/transactions?limit=5");
      const txnData = await txnRes.json();
      if (txnData.success && Array.isArray(txnData.transactions)) {
        // Map to expected format
        const mappedTransactions = txnData.transactions.map((txn: any) => ({
          id: txn._id,
          type: txn.type || "Transaction",
          amount: txn.amount || 0,
          wallet: txn.currency || "USDC",
          status: txn.status || "Pending",
          date: txn.createdAt,
          reference: txn.reference || txn._id,
        }));
        setTransactions(mappedTransactions);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <KYCPopup />

      {/* Welcome Section */}
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <WelcomeGreeting />
      </div>

      {/* Wallet Balance Card */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        <WalletBalanceCard wallets={wallets} />
      </div>

      {/* User Orders Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
        <UserOrders />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="space-y-3 md:space-y-4">
          <CurrencyConverter />
        </div>
        <div className="grid grid-rows-2 gap-3 md:gap-4 h-full">
          <MoneyQuote />
          <DidYouKnow />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-400">
        <RecentActivity transactions={transactions} />
      </div>

      {/* Bank Accounts */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
        <BankAccountsCard />
      </div>
    </div>
  );
}