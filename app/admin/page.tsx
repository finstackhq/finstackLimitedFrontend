// "use client";

// import { useEffect, useState } from "react";
// import { StatsCards } from "@/components/admin/StatsCards";
// import { RecentTransactions } from "@/components/admin/RecentTransactions";

// interface DashboardData {
//   totalTransactionVolume: number;
//   totalActiveUsers: number;
//   totalSuspendedAccounts: number;
//   pendingKYC: number;
//   totalWalletBalance: number;
//   recentTransactions: Array<{
//     id: string;
//     user: string;
//     userEmail: string;
//     type: string;
//     amount: number;
//     currency: string;
//     status: string;
//     date: string;
//     reference: string;
//   }>;
// }

// export default function AdminDashboard() {
//   const [data, setData] = useState<DashboardData | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const response = await fetch("/api/admin/dashboard");
//         if (response.ok) {
//           const dashboardData = await response.json();
//           console.log("Dashboard data:", dashboardData); // Debug log
//           setData(dashboardData);
//         }
//       } catch (error) {
//         console.error("Failed to fetch dashboard data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="space-y-6">
//         <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
//           Dashboard Overview
//         </h1>
//         <div className="animate-pulse">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
//             {[...Array(5)].map((_, i) => (
//               <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
//         Dashboard Overview
//       </h1>
//       {data && (
//         <>
//           <StatsCards data={data} />
//           <RecentTransactions transactions={data.recentTransactions} />
//         </>
//       )}
//     </div>
//   );
// }

// NEW STATS CARDS COMPONENT
"use client";

import { useEffect, useState } from "react";
import { StatsCards } from "@/components/admin/StatsCards";
import { RecentTransactions } from "@/components/admin/RecentTransactions";

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (response.ok) {
          const dashboardData = await response.json();
          console.log("Dashboard data:", dashboardData); // Debug log
          setData(dashboardData.data); // Use only the 'data' property
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="p-10 animate-pulse">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 p-4">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      {data && (
        <>
          <StatsCards data={data} />
          <RecentTransactions transactions={data.recentTransactions || []} />
        </>
      )}
    </div>
  );
}
