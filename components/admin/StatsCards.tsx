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

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";

interface StatsCardsProps {
  data: {
    totalUsers: number;
    suspendedUsers: number;
    pendingKyc: number;
    platformBalances: {
      USDC: number;
      CNGN: number;
      NGN: number;
    };
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

  const stats = [
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
      title: "USDC Liquidity",
      value: formatUSDC(data.platformBalances?.USDC || 0),
      icon: <Wallet className="w-4 h-4 text-green-600" />,
      change: "Live",
      trending: "up" as const,
    },
    {
      title: "CNGN Liquidity",
      value: formatCNGN(data.platformBalances?.CNGN || 0),
      icon: <Wallet className="w-4 h-4 text-purple-600" />,
      change: "Live",
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-medium text-gray-500 uppercase">
              {stat.title}
            </h3>
            {stat.icon}
          </div>
          <p className="text-xl font-bold text-gray-900 mb-1 truncate">
            {stat.value}
          </p>
          <div className="flex items-center text-xs">
            {stat.trending === "up" ? (
              <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-600 mr-1" />
            )}
            <span
              className={
                stat.trending === "up" ? "text-green-600" : "text-red-600"
              }
            >
              {stat.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
