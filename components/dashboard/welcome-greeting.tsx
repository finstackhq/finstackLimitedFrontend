"use client"

import { useEffect, useState } from "react"
import { WelcomeBadge } from "./welcome-badge"

export function WelcomeGreeting() {
  const [firstName, setFirstName] = useState<string>("")
  const [kycStatus, setKycStatus] = useState<string>("false")

  useEffect(() => {
    async function fetchProfileAndSetKyc() {
      try {
        const storedFirst = localStorage.getItem("userFirstName") || ""
        setFirstName(storedFirst || "")
        // Do NOT clear localStorage before setting
        // Try backend first
        const res = await fetch("/api/fstack/profile", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        })
        if (res.ok) {
          const profile = await res.json()
          const data = profile?.data || {}
          if (data?.kycStatus) {
            const backendStatus = String(data.kycStatus).toLowerCase()
            setKycStatus(backendStatus)
            localStorage.setItem("kycStatus", backendStatus)
            return
          } else if (typeof data?.kycVerified !== "undefined") {
            const verifiedStatus = data.kycVerified ? "verified" : "false"
            setKycStatus(verifiedStatus)
            localStorage.setItem("isKycVerified", String(!!data.kycVerified))
            return
          }
        }
        // fallback to localStorage if backend fails or no status
        const kyc = localStorage.getItem("isKycVerified")
        const status = localStorage.getItem("kycStatus")
        if (status) {
          setKycStatus(status.toLowerCase())
          console.warn("[welcome-greeting] fallback localStorage kycStatus:", status)
        } else {
          setKycStatus(kyc === "true" ? "verified" : "false")
          console.warn("[welcome-greeting] fallback localStorage isKycVerified:", kyc)
        }
      } catch (e) {
        // fallback to localStorage
        const kyc = localStorage.getItem("isKycVerified")
        const status = localStorage.getItem("kycStatus")
        if (status) {
          setKycStatus(status.toLowerCase())
          console.warn("[welcome-greeting] error fallback localStorage kycStatus:", status)
        } else {
          setKycStatus(kyc === "true" ? "verified" : "false")
          console.warn("[welcome-greeting] error fallback localStorage isKycVerified:", kyc)
        }
      }
    }
    fetchProfileAndSetKyc()
  }, [])

  return <WelcomeBadge firstName={firstName || "User"} kycStatus={kycStatus} />
}