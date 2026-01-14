"use client"

import { useEffect, useState } from "react"
import { WelcomeBadge } from "./welcome-badge"

export function WelcomeGreeting() {
  const [firstName, setFirstName] = useState<string>("")
  const [kycStatus, setKycStatus] = useState<string>("false")

  useEffect(() => {
    try {
      const storedFirst = localStorage.getItem("userFirstName") || ""
      const kyc = localStorage.getItem("isKycVerified")
      const status = localStorage.getItem("kycStatus")
      
      setFirstName(storedFirst || "")
      // Check for explicit status, fallback to manual verified check
      if (status) {
        setKycStatus(status)
      } else {
        setKycStatus(kyc === "true" ? "approved" : "false")
      }
    } catch (e) {
      console.warn("[welcome-greeting] localStorage unavailable:", e)
    }
  }, [])

  return <WelcomeBadge firstName={firstName || "User"} kycStatus={kycStatus} />
}