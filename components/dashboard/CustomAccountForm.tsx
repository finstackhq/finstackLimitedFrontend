"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CustomAccountFormProps {
  onAccountAdded?: (account: { bankName: string; accountNumber: string; accountName: string }) => void
}

export function CustomAccountForm({ onAccountAdded }: CustomAccountFormProps) {
  const [walletName, setWalletName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const isValid = walletName.trim().length >= 2 && accountNumber.trim().length >= 5 && accountName.trim().length >= 2

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)
    try {
      await onAccountAdded?.({
        bankName: walletName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
      })

      // Reset form
      setWalletName("")
      setAccountNumber("")
      setAccountName("")

      toast({
        title: "Account Added",
        description: "Your custom account has been added successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add account",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="walletName" className="text-xs md:text-sm font-medium text-gray-700">
          Bank / Momo / Wallet Name
        </Label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="walletName"
            placeholder="e.g. MTN Mobile Money, M-Pesa, Wise"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            className="pl-10 border-gray-200 text-sm h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="customAccountNumber" className="text-xs md:text-sm font-medium text-gray-700">
          Account Number / Phone Number
        </Label>
        <Input
          id="customAccountNumber"
          placeholder="Enter account or phone number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          className="border-gray-200 text-sm h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="customAccountName" className="text-xs md:text-sm font-medium text-gray-700">
          Account Name
        </Label>
        <Input
          id="customAccountName"
          placeholder="Name on the account"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          className="border-gray-200 text-sm h-10"
        />
      </div>

      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          "Add Custom Account"
        )}
      </Button>
    </form>
  )
}
