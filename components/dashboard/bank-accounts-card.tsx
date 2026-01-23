"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddAccountDialog } from "@/components/dashboard/add-account-dialog"
import { CreditCard, Loader2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BankAccount {
  id: number | string
  bank: string
  accountNumber: string
  accountName: string
  primary?: boolean
}

export function BankAccountsCard() {
  const { toast } = useToast()
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/fstack/profile?type=bank-accounts')
      const data = await res.json()
      
      if (data.success && Array.isArray(data.data)) {
        const mappedAccounts: BankAccount[] = data.data.map((acc: any, index: number) => ({
          id: acc._id || index + 1,
          bank: acc.bankName,
          accountNumber: acc.accountNumber,
          accountName: acc.accountName,
          primary: index === 0
        }))
        setBankAccounts(mappedAccounts)
      }
    } catch (err) {
      console.error('Failed to fetch bank accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = async (account: { bankName: string; accountNumber: string; accountName: string }) => {
    try {
      const res = await fetch('/api/fstack/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bankName: account.bankName,
          accountNumber: account.accountNumber,
          accountName: account.accountName
        })
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add bank account')
      }

      const newAccount: BankAccount = {
        id: bankAccounts.length + 1,
        bank: account.bankName,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        primary: bankAccounts.length === 0,
      }
      setBankAccounts([...bankAccounts, newAccount])

      toast({
        title: 'Bank Account Added',
        description: 'Your bank account has been added successfully'
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add bank account',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg md:text-xl font-semibold">Bank Accounts</h3>
          <p className="text-xs md:text-sm text-gray-600">Manage your withdrawal accounts</p>
        </div>
        <AddAccountDialog onAccountAdded={handleAddAccount}>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Account
          </Button>
        </AddAccountDialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : bankAccounts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm md:text-base text-gray-600 mb-1">No bank accounts added yet</p>
          <p className="text-xs md:text-sm text-gray-500">Add a bank account to receive payments and withdrawals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="p-3 md:p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-xs md:text-sm">{account.bank}</p>
                    <p className="text-xs md:text-sm text-gray-600">{account.accountNumber}</p>
                    <p className="text-xs md:text-sm text-gray-600">{account.accountName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {account.primary && (
                    <span className="px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note about custom accounts */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs md:text-sm text-gray-600 mb-2">
          <strong>For non-Nigerian users:</strong> Add custom accounts (Mobile Money, International Banks, etc.)
        </p>
        <Link href="/dashboard/settings" className="text-xs md:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium">
          Go to Settings → Payment → Custom Account
        </Link>
      </div>
    </Card>
  )
}
