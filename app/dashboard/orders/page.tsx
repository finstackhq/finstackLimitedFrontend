"use client"

import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Clock, RefreshCw, AlertCircle, Search, Filter, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Order {
    _id: string
    reference: string
    side: "BUY" | "SELL"
    amountFiat: number
    amountCrypto: number
    currencySource: string
    currencyTarget: string
    status: string
    createdAt: string
    [key: string]: any
}

export default function UserOrdersPage() {
    const router = useRouter()
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("ALL")

    const fetchOrders = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await fetch('/api/fstack/my-orders')
            const data = await res.json()
            
            if (res.ok) {
                let fetchedOrders = []
                if (Array.isArray(data)) {
                    fetchedOrders = data
                } else if (Array.isArray(data?.data)) {
                    fetchedOrders = data.data
                } else if (Array.isArray(data?.trades)) {
                    fetchedOrders = data.trades
                } else {
                    console.warn("Unexpected API response structure", data)
                }
                setOrders(fetchedOrders)
                setFilteredOrders(fetchedOrders)
            } else {
                setError("Failed to load orders")
            }
        } catch (err) {
            console.error(err)
            setError("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    useEffect(() => {
        let result = orders

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase()
            result = result.filter(order => 
                order.reference.toLowerCase().includes(lowerQuery) ||
                order.currencyTarget.toLowerCase().includes(lowerQuery) ||
                order.currencySource.toLowerCase().includes(lowerQuery)
            )
        }

        if (statusFilter !== "ALL") {
            result = result.filter(order => order.status.toUpperCase() === statusFilter)
        }

        setFilteredOrders(result)
    }, [searchQuery, statusFilter, orders])

    const getStatusColor = (status: string) => {
        const s = status.toUpperCase()
        if (s.includes("COMPLETED")) return "bg-green-500/10 text-green-500 border-green-500/20"
        if (s.includes("PENDING") || s.includes("PROCESSING") || s.includes("AWAITING")) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        if (s.includes("CANCELLED") || s.includes("DISPUTED")) return "bg-red-500/10 text-red-500 border-red-500/20"
        return "bg-slate-500/10 text-slate-500 border-slate-500/20"
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount)
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2 rounded-full">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            Orders
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        View and manage all your P2P transactions
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchOrders} variant="outline" size="sm" className="gap-2">
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-sm bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                            placeholder="Search by reference or currency..." 
                            className="pl-9 bg-white/50 dark:bg-zinc-800/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 font-medium">
                        {['ALL', 'PENDING_PAYMENT', 'AWAITING_RELEASE', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <Button
                                key={status}
                                variant={statusFilter === status ? "default" : "outline"}
                                size="sm"
                                onClick={() => setStatusFilter(status)}
                                className={cn(
                                    "whitespace-nowrap transition-all",
                                    statusFilter === status && status === 'ALL' && "bg-gray-900",
                                    statusFilter === status && status === 'PENDING_PAYMENT' && "bg-yellow-600 hover:bg-yellow-700",
                                    statusFilter === status && status === 'AWAITING_RELEASE' && "bg-blue-600 hover:bg-blue-700",
                                    statusFilter === status && status === 'COMPLETED' && "bg-green-600 hover:bg-green-700",
                                    statusFilter === status && status === 'CANCELLED' && "bg-red-600 hover:bg-red-700",
                                )}
                            >
                                {status.replace('_', ' ')}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Content */}
            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="border-0 shadow-sm bg-white/50 dark:bg-zinc-900/50">
                            <CardContent className="p-6">
                                <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded mb-4" />
                                <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : error ? (
                <Card className="border-red-100 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-2">
                        <AlertCircle className="w-10 h-10 text-red-500" />
                        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                        <Button variant="outline" onClick={fetchOrders} className="mt-2 text-red-600 border-red-200 hover:bg-red-100 dark:border-red-800 dark:hover:bg-red-900/50">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            ) : filteredOrders.length === 0 ? (
                <Card className="border-dashed border-2 bg-transparent shadow-none">
                    <CardContent className="py-12 flex flex-col items-center justify-center text-center gap-2 text-muted-foreground">
                        <div className="p-3 bg-gray-100 dark:bg-zinc-800 rounded-full mb-2">
                            <Search className="w-6 h-6" />
                        </div>
                        <p className="font-medium">No orders found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                        {statusFilter !== "ALL" && (
                            <Button variant="link" onClick={() => setStatusFilter("ALL")}>
                                Clear filters
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredOrders.map((order) => (
                        <Link href={`/dashboard/orders/${order.reference}`} key={order._id}>
                            <Card className="group hover:border-blue-500/30 transition-all hover:shadow-md cursor-pointer border-0 shadow-sm bg-white dark:bg-zinc-900 ring-1 ring-black/5 dark:ring-white/10">
                                <CardContent className="p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-105 shadow-sm",
                                                order.side === 'BUY' 
                                                    ? "bg-green-100/80 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                                                    : "bg-red-100/80 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                            )}>
                                                {order.side === 'BUY' ? (
                                                    <ArrowDownLeft className="h-5 w-5 stroke-[2.5]" />
                                                ) : (
                                                    <ArrowUpRight className="h-5 w-5 stroke-[2.5]" />
                                                )}
                                            </div>
                                            
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-base text-gray-900 dark:text-gray-100">
                                                        {order.side === 'BUY' ? 'Buy' : 'Sell'} {order.currencyTarget}
                                                    </span>
                                                    <Badge variant="outline" className="font-mono text-muted-foreground">
                                                        {order.reference}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center text-sm text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5 mr-1" />
                                                    {formatDate(order.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:items-end gap-2 pl-[3.5rem] sm:pl-0">
                                            <div className="text-left sm:text-right">
                                                <div className="font-bold text-lg text-gray-900 dark:text-gray-100">
                                                    {formatCurrency(order.amountFiat, order.currencySource)}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-medium">
                                                    ≈ {order.amountCrypto} {order.currencyTarget}
                                                </div>
                                            </div>
                                            <div className={cn(
                                                "inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide w-fit items-center gap-1.5",
                                                getStatusColor(order.status)
                                            )}>
                                                <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                {order.status.replace(/_/g, " ")}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
