"use client";

import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/components/auth-form";
import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Order {
  _id: string;
  reference: string;
  side: "BUY" | "SELL";
  amountFiat: number;
  amountCrypto: number;
  currencySource: string;
  currencyTarget: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

export function UserOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth("/api/fstack/my-orders");
      const data = await res.json();

      if (res.ok) {
        // The backend returns an array according to the user example:
        // [ { ...order1 }, { ...order2 } ]
        // Or sometimes wrapped in a property. Let's check if it's an array directly or inside 'data'.
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (Array.isArray(data?.data)) {
          setOrders(data.data);
        } else if (Array.isArray(data?.trades)) {
          setOrders(data.trades);
        } else {
          console.warn("Unexpected API response structure", data);
          setOrders([]);
        }
      } else {
        setError("Failed to load orders");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("COMPLETED"))
      return "bg-green-500/10 text-green-500 border-green-500/20";
    if (s.includes("PENDING") || s.includes("PROCESSING"))
      return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (s.includes("CANCELLED"))
      return "bg-red-500/10 text-red-500 border-red-500/20";
    return "bg-slate-500/10 text-slate-500 border-slate-500/20";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium flex items-center gap-2">
            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 w-full bg-gray-100 dark:bg-gray-800/50 animate-pulse rounded-lg"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
        <CardContent className="pt-6 flex flex-col items-center justify-center text-center gap-2">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            {error}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOrders}
            className="mt-2 text-red-600 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return null; // Or return a "No orders" state if preferred, but usually empty sections are hidden or show a placeholder.
    // Let's show a placeholder for better UX
    // return (
    //    <Card className="..."> ... No active orders ... </Card>
    // )
    // For now, let's just render nothing if no orders to avoid clutter, or maybe a small empty state?
    // User asked to "build me a new section... make it he first section", so it should probably be visible.
  }

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800/50">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
            Your Orders
          </CardTitle>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Recent Activity
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={fetchOrders}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh orders</span>
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800/50">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order._id}
              onClick={() =>
                router.push(`/dashboard/orders/${order.reference}`)
              }
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-all duration-200 gap-4 cursor-pointer"
            >
              {/* Left Side: Icon & Basic Info */}
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div
                  className={cn(
                    "p-2.5 sm:p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm",
                    order.side === "BUY"
                      ? "bg-green-100/80 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100/80 text-red-600 dark:bg-red-900/30 dark:text-red-400",
                  )}
                >
                  {order.side === "BUY" ? (
                    <ArrowDownLeft className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 stroke-[2.5]" />
                  )}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm sm:text-base text-gray-900 dark:text-gray-100 whitespace-nowrap">
                      {order.side === "BUY" ? "Buy" : "Sell"}{" "}
                      {order.currencyTarget}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 px-1.5 py-0 border-gray-200 dark:border-gray-700 text-muted-foreground rounded-md font-mono truncate max-w-[120px] sm:max-w-none"
                    >
                      {order.reference}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground font-medium">
                    <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Amount & Status */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-1 w-full sm:w-auto pl-[3.25rem] sm:pl-0 mt-[-0.5rem] sm:mt-0">
                <div className="text-right">
                  <span className="block font-bold text-gray-900 dark:text-white text-base sm:text-lg tracking-tight">
                    {formatCurrency(order.amountFiat, order.currencySource)}
                  </span>
                  <span className="block text-xs text-muted-foreground font-medium">
                    ≈ {order.amountCrypto} {order.currencyTarget}
                  </span>
                </div>
                <div
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold border uppercase tracking-wide flex items-center gap-1.5 flex-shrink-0",
                    getStatusColor(order.status),
                  )}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  {order.status.replace(/_/g, " ")}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 bg-gray-50/50 dark:bg-gray-900/30 text-center border-t border-gray-100 dark:border-gray-800/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/orders")}
            className="text-xs text-muted-foreground hover:text-foreground font-medium h-auto py-2.5 sm:py-2 w-full sm:w-auto bg-white/50 sm:bg-transparent border sm:border-0 border-gray-200 dark:border-gray-800 rounded-lg sm:rounded-md shadow-sm sm:shadow-none"
          >
            View All Orders
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
