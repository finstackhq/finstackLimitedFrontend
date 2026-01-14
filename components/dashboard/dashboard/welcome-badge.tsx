"use client"

import { CheckCircle2, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface WelcomeBadgeProps {
  firstName: string
  isKYCVerified: boolean
}

export function WelcomeBadge({ firstName, isKYCVerified }: WelcomeBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Welcome, {firstName}</h1>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            {isKYCVerified ? (
              <CheckCircle2 className="w-5 h-5 text-[#2F67FA] animate-in fade-in duration-300" />
            ) : (
              <Clock className="w-5 h-5 text-gray-400 animate-in fade-in duration-300" />
            )}
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-sm">{isKYCVerified ? "KYC Verified" : "KYC Verification Pending"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
