"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { CustomerOrderFlow } from "@/components/p2p/CustomerOrderFlow"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function OrderDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchOrder = async () => {
             // params.id is likely the 'reference' or '_id'. Backend expects reference usually for trade endpoints.
            try {
                const res = await fetch(`/api/fstack/my-orders/${params.id}`)
                const json = await res.json()

                if (json.success && json.data) {
                    const t = json.data
                    // Map backend data to P2POrder interface expected by CustomerOrderFlow
                    
                    const mappedOrder = {
                        ...t,
                        id: t._id,
                        reference: t.reference || t._id,
                        
                        sellerName: t.merchantId?.username || t.merchantName || "Merchant", 
                        buyerName: t.userId?.username || "Me",
                        
                        cryptoAmount: t.amountCrypto,
                        fiatAmount: t.amountFiat,
                        cryptoCurrency: t.currencyTarget,
                        fiatCurrency: t.currencySource,
                        paymentMethod: t.provider || "Bank Transfer", 
                        status: t.status,
                        createdAt: new Date(t.createdAt),
                        expiresAt: new Date(t.expiresAt || new Date(t.createdAt).getTime() + 30*60000),
                        
                        // Payment details might be in `paymentDetails` or flat
                        bankName: t.paymentDetails?.bankName,
                        bankAccountNumber: t.paymentDetails?.accountNumber,
                        bankAccountName: t.paymentDetails?.accountName,
                        
                        side: t.side, 
                    }
                    setOrder(mappedOrder)
                } else {
                    setError("Order not found")
                }
            } catch (err) {
                console.error(err)
                setError("Failed to load order")
            } finally {
                setLoading(false)
            }
        }

        if (params.id) {
            fetchOrder()
        }
    }, [params.id])

    const handleMarkPaid = async (proof?: string) => {
        try {
            // Need API endpoint to mark paid. Usually: POST /api/trade/[id]/paid
            // Or passing proof.
            // Let's assume an endpoint similar to merchant flow exists or use `confirm-payment`
            const res = await fetch(`/api/fstack/trade/${order.reference}/paid`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentProof: proof })
            })
            const data = await res.json()
            if (res.ok) {
                // Refresh
                setOrder({ ...order, status: 'awaiting_release' })
            } else {
                 toast({ title: "Error", description: data.message || "Failed to mark paid", variant: "destructive" })
            }
        } catch (e) {
             toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
        }
    }

    const handleCancel = async () => {
         try {
            const res = await fetch(`/api/fstack/trade/${order.reference}/cancel`, {
                method: 'POST'
            })
             if (res.ok) {
                router.push('/dashboard/orders')
            } else {
                 toast({ title: "Error", description: "Failed to cancel order", variant: "destructive" })
            }
        } catch (e) {
             toast({ title: "Error", description: "Something went wrong", variant: "destructive" })
        }
    }
    
    // Handler for Releasing Crypto (User Selling)
    // We need to pass this to CustomerOrderFlow if we update it
    const handleRelease = async (otpCode: string) => {
         // Logic to release
    }

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="max-w-3xl mx-auto py-8 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
                <p className="text-muted-foreground mb-6">{error || "The order you are looking for does not exist."}</p>
                <Button onClick={() => router.push('/dashboard/orders')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <Button variant="ghost" onClick={() => router.push('/dashboard/orders')} className="-ml-4 text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Button>
            
            <div>
                <h1 className="text-2xl font-bold">Order Details</h1>
                <p className="text-muted-foreground text-sm">Reference: {order.reference}</p>
            </div>

            <CustomerOrderFlow 
                order={order} 
                onMarkPaid={handleMarkPaid} 
                onCancel={handleCancel}
                // We will add onRelease prop next
            />
        </div>
    )
}
