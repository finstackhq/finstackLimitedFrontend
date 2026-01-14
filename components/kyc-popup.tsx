"use client"

import { useEffect, useState } from "react"
import { X, ShieldAlert } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function KYCPopup() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      const isVerified = localStorage.getItem("isKycVerified")
      const status = localStorage.getItem("kycStatus")?.toLowerCase()
      
      // Don't show if verified or pending
      const isPending = status === "pending" || status === "submitted" || status === "in_review"
      
      // Show only if logged in AND explicitly 'false' AND NOT pending
      if (accessToken && isVerified === "false" && !isPending) {
        // Add a small delay so it doesn't flash immediately on load
        const timer = setTimeout(() => {
          setIsVisible(true)
        }, 1500)
        return () => clearTimeout(timer)
      }
    } catch (e) {
      console.error("Error checking KYC status:", e)
    }
  }, [])

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVisible(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-background w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-border"
          >
            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex flex-col items-center text-center p-8 pt-10">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
              </div>

              <h2 className="text-2xl font-bold mb-2">Verify Your Identity</h2>
              <p className="text-muted-foreground mb-8">
                Your account is currently unverified. Please complete the KYC process to unlock all features and ensure account security.
              </p>

              <div className="flex flex-col w-full gap-3">
                <Button 
                  asChild 
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-lg font-semibold shadow-lg shadow-primary/20"
                >
                  <Link href="/dashboard/settings">
                    Verify Now
                  </Link>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setIsVisible(false)}
                  className="w-full text-muted-foreground hover:text-foreground"
                >
                  I'll do it later
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
