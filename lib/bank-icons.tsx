import { Building2 } from "lucide-react"

// Bank icon mapping with common Nigerian banks
export const bankIcons: Record<string, string> = {
  // Major Nigerian Banks
  "044": "https://nigerianbanks.xyz/logo/access-bank.png", // Access Bank
  "058": "https://nigerianbanks.xyz/logo/gtbank.png", // GTBank
  "057": "https://nigerianbanks.xyz/logo/zenith-bank.png", // Zenith Bank
  "033": "https://nigerianbanks.xyz/logo/uba.png", // UBA
  "011": "https://nigerianbanks.xyz/logo/first-bank.png", // First Bank
  "023": "https://nigerianbanks.xyz/logo/citibank.png", // Citibank
  "214": "https://nigerianbanks.xyz/logo/fcmb.png", // FCMB
  "070": "https://nigerianbanks.xyz/logo/fidelity-bank.png", // Fidelity Bank
  "050": "https://nigerianbanks.xyz/logo/ecobank.png", // Ecobank
  "084": "https://nigerianbanks.xyz/logo/enterprise-bank.png", // Enterprise Bank
  "221": "https://nigerianbanks.xyz/logo/stanbic-ibtc.png", // Stanbic IBTC
  "232": "https://nigerianbanks.xyz/logo/sterling-bank.png", // Sterling Bank
  "032": "https://nigerianbanks.xyz/logo/union-bank.png", // Union Bank
  "035": "https://nigerianbanks.xyz/logo/wema-bank.png", // Wema Bank
  "563": "https://nigerianbanks.xyz/logo/polaris-bank.png", // Polaris Bank
  "101": "https://nigerianbanks.xyz/logo/providus-bank.png", // Providus Bank
  "566": "https://nigerianbanks.xyz/logo/jaiz-bank.png", // Jaiz Bank
  "076": "https://nigerianbanks.xyz/logo/keystone-bank.png", // Keystone Bank
  "082": "https://nigerianbanks.xyz/logo/keystone-bank.png", // Keystone Bank (Alternative)
  
  // Digital Banks
  "100": "https://nigerianbanks.xyz/logo/suntrust-bank.png", // Suntrust Bank
  "304": "https://nigerianbanks.xyz/logo/stanbic-ibtc.png", // Stanbic Mobile
  "090": "https://nigerianbanks.xyz/logo/fcmb.png", // FCMB Mobile
  
  // Microfinance Banks
  "103": "https://nigerianbanks.xyz/logo/globus-bank.png", // Globus Bank
  "104": "https://nigerianbanks.xyz/logo/parallex-bank.png", // Parallex Bank
  "105": "https://nigerianbanks.xyz/logo/one-finance.png", // One Finance
  
  // Fintech Banks
  "100002": "https://nigerianbanks.xyz/logo/paga.png", // Paga
  "100003": "https://nigerianbanks.xyz/logo/kuda-bank.png", // Kuda Bank
  "100004": "https://nigerianbanks.xyz/logo/carbon.png", // Carbon
  "100005": "https://nigerianbanks.xyz/logo/vfd-bank.png", // VFD Bank
}

// Fallback bank colors for better visual distinction
export const bankColors: Record<string, string> = {
  "044": "#004C97", // Access Bank - Blue
  "058": "#FF6B35", // GTBank - Orange
  "057": "#ED1C24", // Zenith Bank - Red
  "033": "#D42128", // UBA - Red
  "011": "#004B87", // First Bank - Blue
  "023": "#1F75FE", // Citibank - Blue
  "214": "#8B0000", // FCMB - Dark Red
  "070": "#006837", // Fidelity Bank - Green
  "050": "#0052A3", // Ecobank - Blue
  "084": "#FF6B35", // Enterprise Bank - Orange
  "221": "#005EB8", // Stanbic IBTC - Blue
  "232": "#1F4E79", // Sterling Bank - Navy
  "032": "#FFD700", // Union Bank - Gold
  "035": "#9C0000", // Wema Bank - Maroon
  "563": "#1E3A8A", // Polaris Bank - Blue
  "101": "#DC2626", // Providus Bank - Red
  "566": "#059669", // Jaiz Bank - Green
  "076": "#7C3AED", // Keystone Bank - Purple
}

// Get bank icon component
export function getBankIcon(bankCode: string, bankName: string, size: "sm" | "md" | "lg" = "md") {
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  const iconUrl = bankIcons[bankCode]
  const fallbackColor = bankColors[bankCode] || "#6B7280"
  
  if (iconUrl) {
    return (
      <img 
        src={iconUrl} 
        alt={`${bankName} logo`}
        className={`${iconSizes[size]} rounded-sm object-contain`}
        onError={(e) => {
          // Fallback to colored icon if image fails to load
          const target = e.target as HTMLImageElement
          target.style.display = 'none'
          target.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }
  
  // Fallback to colored Building2 icon
  return (
    <div 
      className={`${iconSizes[size]} rounded-sm flex items-center justify-center`}
      style={{ backgroundColor: fallbackColor }}
    >
      <Building2 className={`${size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3.5 h-3.5" : "w-5 h-5"} text-white`} />
    </div>
  )
}

// Get bank icon as JSX with fallback
export function BankIcon({ bankCode, bankName, size = "md", className = "" }: {
  bankCode: string
  bankName: string
  size?: "sm" | "md" | "lg"
  className?: string
}) {
  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  }
  
  const iconUrl = bankIcons[bankCode]
  const fallbackColor = bankColors[bankCode] || "#6B7280"
  
  return (
    <div className={`relative ${iconSizes[size]} ${className}`}>
      {iconUrl && (
        <img 
          src={iconUrl} 
          alt={`${bankName} logo`}
          className={`${iconSizes[size]} rounded-sm object-contain`}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const fallback = target.nextElementSibling as HTMLElement
            if (fallback) {
              fallback.classList.remove('hidden')
            }
          }}
        />
      )}
      <div 
        className={`${!iconUrl ? '' : 'hidden'} ${iconSizes[size]} rounded-sm flex items-center justify-center`}
        style={{ backgroundColor: fallbackColor }}
      >
        <Building2 className={`${size === "sm" ? "w-2.5 h-2.5" : size === "md" ? "w-3.5 h-3.5" : "w-5 h-5"} text-white`} />
      </div>
    </div>
  )
}