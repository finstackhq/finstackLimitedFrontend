// "use client";

// import { TrendingUp, TrendingDown } from "lucide-react";

// interface StatsData {
//   totalTransactionVolume: number;
//   totalActiveUsers: number;
//   totalSuspendedAccounts: number;
//   pendingKYC: number;
//   totalWalletBalance: number;
// }

// interface StatsCardsProps {
//   data: StatsData;
// }

// export function StatsCards({ data }: StatsCardsProps) {
//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-US", {
//       style: "currency",
//       currency: "USD",
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatNumber = (num: number) => {
//     return new Intl.NumberFormat("en-US").format(num);
//   };

//   const stats = [
//     {
//       title: "Total Transaction Volume",
//       value: formatCurrency(data.totalTransactionVolume),
//       change: "+12.5%",
//       trending: "up" as const,
//     },
//     {
//       title: "Total Active Users",
//       value: formatNumber(data.totalActiveUsers),
//       change: "+8.2%",
//       trending: "up" as const,
//     },
//     {
//       title: "Suspended Accounts",
//       value: formatNumber(data.totalSuspendedAccounts),
//       change: "-2.1%",
//       trending: "down" as const,
//     },
//     {
//       title: "Pending KYC",
//       value: formatNumber(data.pendingKYC),
//       change: "+15.3%",
//       trending: "up" as const,
//     },
//     {
//       title: "Total Wallet Balance",
//       value: formatCurrency(data.totalWalletBalance),
//       change: "+5.7%",
//       trending: "up" as const,
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
//       {stats.map((stat) => (
//         <div
//           key={stat.title}
//           className="bg-white p-3 sm:p-4 lg:p-6 rounded-lg border border-gray-200 shadow-sm min-w-0"
//         >
//           <h3 className="text-xs font-medium text-gray-500 mb-2 truncate">
//             {stat.title}
//           </h3>
//           <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-1 truncate">
//             {stat.value}
//           </p>
//           <div className="flex items-center">
//             {stat.trending === "up" ? (
//               <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-green-600 mr-1" />
//             ) : (
//               <TrendingDown className="w-3 h-3 md:w-4 md:h-4 text-red-600 mr-1" />
//             )}
//             <p
//               className={`text-xs ${
//                 stat.trending === "up" ? "text-green-600" : "text-red-600"
//               }`}
//             >
//               {stat.change}
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

"use client";

import type { ReactNode } from "react";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Clock,
  AlertCircle,
  Landmark,
} from "lucide-react";

interface StatCard {
  title: string;
  value: string;
  icon: ReactNode;
  change?: string;
  trending?: "up" | "down";
  helperText?: string;
  lastUpdated?: string;
  statusLabel?: "LIVE" | "UNAVAILABLE";
}

interface StatsCardsProps {
  data: {
    totalUsers: number;
    suspendedUsers: number;
    pendingKyc: number;
    platformBalances: {
      USDC: number;
      CNGN: number;
      NGN: number | null;
    };
    platformBalanceStatus?: { NGN?: string };
    platformBalanceFetchedAt?: { NGN?: string | null };
    totalTransactionVolume?: number;
  };
}

export function StatsCards({ data }: StatsCardsProps) {
  // Formatter for USD/USDC
  const formatUSDC = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Formatter for CNGN (Naira)
  const formatCNGN = (amount: number) => {
    return "₦ " + new Intl.NumberFormat("en-NG").format(amount);
  };

  const formatNumber = (num: number) =>
    new Intl.NumberFormat("en-US").format(num);

  const nombaNgnAmount = data.platformBalances?.NGN;
  const nombaNgnIsLive =
    data.platformBalanceStatus?.NGN === "LIVE" &&
    typeof nombaNgnAmount === "number";
  const fetchedAtValue = data.platformBalanceFetchedAt?.NGN;
  const fetchedAt = fetchedAtValue ? new Date(fetchedAtValue) : null;
  const nombaLastUpdated =
    fetchedAt && !Number.isNaN(fetchedAt.getTime())
      ? fetchedAt.toLocaleString()
      : undefined;

  const overviewStats: StatCard[] = [
    {
      title: "Total Users",
      value: formatNumber(data.totalUsers || 0),
      icon: <Users className="w-4 h-4 text-blue-600" />,
      change: "+8.2%",
      trending: "up" as const,
    },
    {
      title: "Pending KYC",
      value: formatNumber(data.pendingKyc || 0),
      icon: <Clock className="w-4 h-4 text-orange-600" />,
      change: "Action",
      trending: "up" as const,
    },
    {
      title: "Suspended",
      value: formatNumber(data.suspendedUsers || 0),
      icon: <AlertCircle className="w-4 h-4 text-red-600" />,
      change: "-2%",
      trending: "down" as const,
    },
  ];

  const liquidityStats: StatCard[] = [
    {
      title: "USDC Liquidity",
      value: formatUSDC(data.platformBalances?.USDC || 0),
      icon: <Wallet className="w-4 h-4 text-green-600" />,
      statusLabel: "LIVE",
    },
    {
      title: "CNGN Liquidity",
      value: formatCNGN(data.platformBalances?.CNGN || 0),
      icon: <Wallet className="w-4 h-4 text-purple-600" />,
      statusLabel: "LIVE",
    },
    {
      title: "Nomba Payout Balance (NGN)",
      value: nombaNgnIsLive ? formatCNGN(nombaNgnAmount) : "Unavailable",
      icon: <Landmark className="w-4 h-4 text-emerald-600" />,
      helperText:
        "Finstack’s NGN balance held with Nomba, which Nomba uses to fund bank payouts.",
      lastUpdated: nombaLastUpdated,
      statusLabel: nombaNgnIsLive ? "LIVE" : "UNAVAILABLE",
    },
  ];

  const renderCards = (stats: StatCard[]) => (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="flex h-full min-h-[148px] min-w-0 flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-medium leading-5 text-gray-600">
              {stat.title}
            </h3>
            <span className="shrink-0">{stat.icon}</span>
          </div>
          <p className="mt-3 break-words text-2xl font-semibold text-gray-900">
            {stat.value}
          </p>
          {stat.helperText && (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              {stat.helperText}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-4">
            {stat.lastUpdated ? (
              <p className="text-xs text-gray-500">
                Last updated: {stat.lastUpdated}
              </p>
            ) : (
              <span />
            )}
            {stat.statusLabel ? (
              <span
                className={`text-xs font-medium ${
                  stat.statusLabel === "LIVE"
                    ? "text-green-600"
                    : "text-gray-500"
                }`}
              >
                {stat.statusLabel === "LIVE" ? "Live" : "Unavailable"}
              </span>
            ) : (
              <div className="flex items-center text-xs">
                {stat.trending === "up" ? (
                  <TrendingUp className="mr-1 h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="mr-1 h-3 w-3 text-red-600" />
                )}
                <span
                  className={
                    stat.trending === "up" ? "text-green-600" : "text-red-600"
                  }
                >
                  {stat.change}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <section className="space-y-3" aria-labelledby="overview-metrics-heading">
        <h2
          id="overview-metrics-heading"
          className="text-sm font-semibold text-gray-700"
        >
          Platform Overview
        </h2>
        {renderCards(overviewStats)}
      </section>
      <section className="space-y-3" aria-labelledby="liquidity-metrics-heading">
        <h2
          id="liquidity-metrics-heading"
          className="text-sm font-semibold text-gray-700"
        >
          Platform Liquidity
        </h2>
        {renderCards(liquidityStats)}
      </section>
    </div>
  );
}
