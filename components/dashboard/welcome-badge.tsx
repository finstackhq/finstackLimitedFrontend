"use client"

import { BadgeCheck, Clock, ShieldAlert } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WelcomeBadgeProps {
  firstName: string
  kycStatus: string
}

export function WelcomeBadge({ firstName, kycStatus }: WelcomeBadgeProps) {
  // Normalize status
  const status = kycStatus?.toLowerCase()
  const isVerified = status === "true" || status === "approved" || status === "verified"
  const isPending = status === "pending" || status === "submitted" || status === "in_review"
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Welcome, {firstName}</h1>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="cursor-help">
                {isVerified ? (
                  <BadgeCheck className="w-6 h-6 text-[#2F67FA] animate-in fade-in duration-300" />
                ) : isPending ? (
                  <Clock className="w-6 h-6 text-yellow-500 animate-in fade-in duration-300" />
                ) : (
                  <ShieldAlert className="w-6 h-6 text-red-500 animate-in fade-in duration-300" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">
                {isVerified ? "KYC Verified" : isPending ? "KYC Verification Pending" : "KYC Not Verified"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      {/* Explicit status text as requested */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Account Status:</span>
        {isVerified ? (
          <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full dark:bg-green-900/30 border border-green-200 dark:border-green-800">
            Verified
          </span>
        ) : isPending ? (
          <span className="text-sm font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
            Pending
          </span>
        ) : (
          <span className="text-sm font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full dark:bg-red-900/30 border border-red-200 dark:border-red-800">
            Not Verified
          </span>
        )}
      </div>
    </div>
  )
}
