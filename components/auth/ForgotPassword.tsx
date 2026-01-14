"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ForgotPassword() {
  const { toast } = useToast()
  const router = useRouter()
  const [email, setEmail] = useState<string>("")
  const [isSending, setIsSending] = useState<boolean>(false)

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      toast({ title: "Enter a valid email", variant: "destructive" })
      return
    }
    setIsSending(true)
    try {
      const res = await fetch("/api/fstack/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast({
          title: "Request failed",
          description: data?.message || data?.error || `Error ${res.status}`,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Reset link sent",
        description: `We sent a password reset link to ${email}.`,
      })
      // Optional: navigate users to verify or login
      // router.push("/verify-email")
    } catch (e: any) {
      toast({ title: "Network error", description: e?.message || "Please try again.", variant: "destructive" })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-0 bg-card rounded-none sm:rounded-2xl overflow-hidden shadow-2xl">
        {/* Left side - Image (desktop) */}
        <div className="hidden lg:block relative bg-linear-to-br from-primary/10 to-primary/5">
          <img
            src="/mobile-app-signup-screen-with-verification.jpg"
            alt="Forgot your password"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
        </div>

        {/* Right side - Content */}
        <div className="p-4 sm:p-8 lg:p-16 flex flex-col justify-center">
          <Card className="p-6 sm:p-8 space-y-6 border-0 shadow-none">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold">Forgot Password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your registered email address and we’ll send you a password reset link.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <Button className="w-full" onClick={handleSubmit} disabled={isSending || !email}>
                {isSending ? "Sending…" : "Send Reset Link"}
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
                Back to login
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}