"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Mail } from "lucide-react"

// Helper to decode JWT payload and extract email
function decodeEmailFromJwt(token: string): string {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return ""
    // Decode the payload (second part)
    const payload = parts[1]
    // Handle base64url encoding (replace - with + and _ with /)
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(base64)
    const parsed = JSON.parse(decoded)
    return parsed?.email || ""
  } catch {
    return ""
  }
}

export function VerifyEmail() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  // Token-only access like ResetPassword. Accept multiple param names and path segment fallback.
  const token = useMemo(() => {
    const t =
      searchParams.get("verifyToken") ||
      searchParams.get("token") ||
      searchParams.get("emailToken") ||
      ""
    if (t) return t

    try {
      const url = new URL(window.location.href)
      const params = new URLSearchParams(url.search)
      const fromParams =
        params.get("verifyToken") || params.get("token") || params.get("emailToken")
      if (fromParams) return fromParams

      const parts = url.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1]
      if (last && last.length > 20) return last
    } catch {}

    return ""
  }, [searchParams])

  // Email resolution priority: URL param → decoded from JWT → localStorage
  const emailFromQuery = useMemo(() => {
    // 1. Check URL param first
    const urlEmail = searchParams?.get("email") || ""
    if (urlEmail) return urlEmail
    
    // 2. Try to decode from JWT token
    if (token) {
      const jwtEmail = decodeEmailFromJwt(token)
      if (jwtEmail) return jwtEmail
    }
    
    return ""
  }, [searchParams, token])
  const [email, setEmail] = useState<string>("")
  const [isResending, setIsResending] = useState<boolean>(false)
  const [verifying, setVerifying] = useState<boolean>(false)

  useEffect(() => {
    if (!token) {
      toast({
        title: "Missing verification token",
        description: "The verification link is invalid or expired.",
        variant: "destructive",
      })
    }

    if (emailFromQuery) {
      setEmail(emailFromQuery)
      try {
        localStorage.setItem("pendingVerifyEmail", emailFromQuery)
      } catch (e) {}
    } else {
      try {
        const stored = localStorage.getItem("pendingVerifyEmail")
        if (stored) setEmail(stored)
      } catch (e) {}
    }
  }, [emailFromQuery, token, toast])

  const handleVerify = async () => {
    if (!token) return
    setVerifying(true)
    try {
      const res = await fetch("/api/fstack/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, verifyToken: token }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast({ title: "Email verified", description: "Your email has been verified." })
        router.push("/login")
      } else {
        toast({
          title: "Verification failed",
          description: data?.message || data?.error || `Error ${res.status}. Please request a new link.`,
          variant: "destructive",
        })
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e?.message || "Please try again.", variant: "destructive" })
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      toast({ title: "Missing email", description: "We couldn’t determine your email.", variant: "destructive" })
      return
    }
    setIsResending(true)
    try {
      const res = await fetch("/api/fstack/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        toast({ title: "Verification link resent", description: `We sent a new link to ${email}.` })
      } else {
        toast({ title: "Failed to resend", description: data?.message || data?.error || "Please try again.", variant: "destructive" })
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e?.message || "Please try again.", variant: "destructive" })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-10 bg-background relative overflow-hidden">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-1/4 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

      <Card className="w-full max-w-lg p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Mail className="h-7 w-7 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Verify Your Email!</h1>
            <p className="text-sm text-muted-foreground">
              Click the button below to verify your email address.
            </p>
          </div>

          {!token ? (
            <div className="w-full rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive text-center">
              Verification token not found. Request a new verification link.
            </div>
          ) : null}

          <div className="w-full rounded-xl border bg-muted/30 p-4">
            <div className="space-y-1 text-center">
              <Label className="text-xs text-muted-foreground">Registered email</Label>
              <p className="text-base font-medium break-all">{email || "—"}</p>
            </div>
          </div>

          <div className="w-full flex flex-col gap-3">
            <Button onClick={handleVerify} disabled={!token || verifying} className="w-full">
              {verifying ? "Verifying…" : "Verify Email"}
            </Button>
            <Button onClick={handleResend} disabled={!email || isResending} className="w-full" variant="secondary">
              {isResending ? "Resending…" : "Resend verification link"}
            </Button>
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              Already verified? Go to login
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Tip: Check your spam/junk folder if you don’t see the email.
          </p>
        </div>
      </Card>
    </div>
  )
}
