"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Check, ChevronsUpDown, Building2, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

interface Bank {
  id: number
  name: string
  code: string
  longcode: string
  gateway: string
  pay_with_bank: boolean
  active: boolean
  country: string
  currency: string
  type: string
  is_deleted: boolean
  createdAt: string
  updatedAt: string
}

interface AccountVerificationResponse {
  status: boolean
  message: string
  data: {
    account_number: string
    account_name: string
    bank_id: number
  }
}

interface AddAccountDialogProps {
  children: React.ReactNode
  onAccountAdded?: (account: { bankName: string; accountNumber: string; accountName: string }) => void
}

export function AddAccountDialog({ children, onAccountAdded }: AddAccountDialogProps) {
  const [open, setOpen] = useState(false)
  const [banks, setBanks] = useState<Bank[]>([])
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isLoadingBanks, setIsLoadingBanks] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showBankList, setShowBankList] = useState(false)
  const { toast } = useToast()

  // Filter banks based on search term
  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Fetch Nigerian banks from Paystack
  const fetchBanks = async () => {
    setIsLoadingBanks(true)
    try {
      console.log("Fetching banks from Paystack API...")
      const response = await fetch("/api/paystack/banks")
      const data = await response.json()
      
      console.log("API Response:", { status: response.status, data })
      
      if (response.ok && data.status) {
        const nigerianBanks = data.data.filter((bank: Bank) => bank.country === "Nigeria")
        console.log("Nigerian banks found:", nigerianBanks.length)
        setBanks(nigerianBanks)
      } else {
        throw new Error(data.message || "Failed to fetch banks")
      }
    } catch (error: any) {
      console.error("Error fetching banks:", error)
      toast({
        title: "Error",
        description: "Failed to load banks. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingBanks(false)
    }
  }

  // Verify account number with Paystack
  const verifyAccount = async () => {
    if (!selectedBank || !accountNumber || accountNumber.length < 10) return

    setIsVerifying(true)
    setVerificationStatus("idle")
    setErrorMessage("")
    
    try {
      const response = await fetch("/api/paystack/verify-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_number: accountNumber,
          bank_code: selectedBank.code,
        }),
      })
      
      const data: AccountVerificationResponse = await response.json()
      
      if (response.ok && data.status) {
        setAccountName(data.data.account_name)
        setVerificationStatus("success")
      } else {
        setVerificationStatus("error")
        setErrorMessage("Unable to verify account. Please check the account number and bank selection.")
      }
    } catch (error: any) {
      setVerificationStatus("error")
      setErrorMessage("Unable to verify account. Please check the account number and bank selection.")
      console.error("Error verifying account:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleAddAccount = () => {
    if (selectedBank && accountNumber && accountName) {
      onAccountAdded?.({
        bankName: selectedBank.name,
        accountNumber,
        accountName,
      })
      
      toast({
        title: "Account Added",
        description: `${selectedBank.name} account has been added successfully.`,
      })
      
      // Reset form
      setSelectedBank(null)
      setAccountNumber("")
      setAccountName("")
      setVerificationStatus("idle")
      setErrorMessage("")
      setOpen(false)
    }
  }

  useEffect(() => {
    if (open && banks.length === 0) {
      fetchBanks()
    }
  }, [open])

  useEffect(() => {
    if (accountNumber.length === 10 && selectedBank) {
      verifyAccount()
    } else {
      setAccountName("")
      setVerificationStatus("idle")
      setErrorMessage("")
    }
  }, [accountNumber, selectedBank])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Element
      if (!target.closest('.bank-dropdown')) {
        setShowBankList(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Add Bank Account
          </DialogTitle>
          <DialogDescription>
            Add a new bank account for withdrawals and payments.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Bank Selection */}
          <div className="space-y-2">
            <Label htmlFor="bank">Select Bank</Label>
            {isLoadingBanks ? (
              <div className="flex items-center justify-center p-4 border rounded-lg bg-gray-50">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-600">Loading banks...</span>
              </div>
            ) : (
              <div className="relative bank-dropdown">
                <div className="relative">
                  <Input
                    placeholder="Search and select bank..."
                    value={selectedBank ? selectedBank.name : searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setShowBankList(true)
                      if (selectedBank) {
                        setSelectedBank(null)
                      }
                    }}
                    onFocus={() => setShowBankList(true)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowBankList(!showBankList)}
                  >
                    <ChevronsUpDown className={cn(
                      "h-4 w-4 opacity-50 transition-transform duration-200",
                      showBankList && "transform rotate-180"
                    )} />
                  </Button>
                </div>
                
                {showBankList && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredBanks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Building2 className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">No bank found.</p>
                        <p className="text-xs text-gray-400">Try searching with a different name.</p>
                      </div>
                    ) : (
                      <div className="py-1">
                        {filteredBanks.map((bank) => (
                          <button
                            key={bank.id}
                            type="button"
                            className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 flex items-center justify-between"
                            onClick={() => {
                              console.log("Bank selected:", bank.name)
                              setSelectedBank(bank)
                              setSearchTerm("")
                              setShowBankList(false)
                            }}
                          >
                            <span className="font-medium">{bank.name}</span>
                            {selectedBank?.id === bank.id && (
                              <Check className="ml-2 h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <div className="relative">
              <Input
                id="accountNumber"
                placeholder="Enter 10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={cn(
                  "pr-10",
                  verificationStatus === "success" && "border-green-500",
                  verificationStatus === "error" && "border-red-500"
                )}
                maxLength={10}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isVerifying && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                {verificationStatus === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                {verificationStatus === "error" && <AlertCircle className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </div>

          {/* Account Name */}
          {(accountName || errorMessage) && (
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              {accountName && (
                <div className="p-3 rounded-md bg-green-50 border border-green-200">
                  <p className="text-sm font-medium text-green-800">{accountName}</p>
                </div>
              )}
              {errorMessage && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800">{errorMessage}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddAccount}
            disabled={!selectedBank || !accountNumber || !accountName || verificationStatus !== "success"}
          >
            Add Account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}