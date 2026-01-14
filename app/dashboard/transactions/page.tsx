"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Search, ChevronLeft, ChevronRight, Receipt, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TransactionReceiptModal } from "@/components/dashboard/transaction-receipt-modal"

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("All")
  const [filterStatus, setFilterStatus] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Receipt modal state
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Fetch transactions
  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/fstack/transactions')
      const data = await res.json()

      if (data.success && Array.isArray(data.transactions)) {
        // Map backend data to frontend format
        const mappedTransactions = data.transactions.map((txn: any) => ({
          id: txn._id,
          type: txn.type || 'Transaction',
          amount: txn.amount || 0,
          wallet: txn.currency || 'USDC',
          status: txn.status || 'Pending',
          date: txn.createdAt,
          reference: txn.reference || txn._id,
          txHash: txn.txHash,
          network: txn.network,
        }))
        setTransactions(mappedTransactions)
      } else {
        setTransactions([])
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }
  
  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction)
    setIsReceiptModalOpen(true)
  }
  
  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false)
    setSelectedTransaction(null)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "All" || transaction.type.toUpperCase() === filterType.toUpperCase()
    const matchesStatus = filterStatus === "All" || transaction.status.toUpperCase() === filterStatus.toUpperCase()
    return matchesSearch && matchesType && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  const getStatusColor = (status: string) => {
    const statusUpper = status.toUpperCase()
    if (statusUpper.includes('COMPLETED') || statusUpper.includes('SUCCESS')) {
      return "text-green-600 bg-green-50"
    } else if (statusUpper.includes('PENDING') || statusUpper.includes('PROCESSING')) {
      return "text-yellow-600 bg-yellow-50"
    } else if (statusUpper.includes('FAILED') || statusUpper.includes('REJECTED')) {
      return "text-red-600 bg-red-50"
    }
    return "text-gray-600 bg-gray-50"
  }

  const handleExport = (format: "pdf" | "csv") => {
    console.log(`Exporting transactions as ${format}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-top-4 duration-500">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-2">Transaction History</h1>
        <p className="text-sm md:text-base text-gray-600">View and manage all your transactions</p>
      </div>

      <Card className="p-4 md:p-6 shadow-lg border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Filters and Search */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by reference or type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm font-medium text-foreground"
            >
              <option value="All">All Types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="P2P">P2P Trade</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md bg-white text-sm font-medium text-foreground"
            >
              <option value="All">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("pdf")}
              className="text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] text-xs md:text-sm"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              PDF
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("csv")}
              className="text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] text-xs md:text-sm"
            >
              <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
              CSV
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Reference</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Amount</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Currency</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      onClick={() => handleTransactionClick(transaction)}
                      className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-2 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-gray-400">{new Date(transaction.date).toLocaleTimeString()}</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-medium text-foreground group-hover:text-[#2F67FA] transition-colors">{transaction.type}</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm font-mono text-gray-600">{transaction.reference}</span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="font-semibold text-foreground">
                          ${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-4 px-2">
                        <span className="text-sm text-gray-600">{transaction.wallet}</span>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn("text-xs px-2 py-1 rounded-full font-medium", getStatusColor(transaction.status))}
                          >
                            {transaction.status}
                          </span>
                          <Receipt className="w-4 h-4 text-gray-400 group-hover:text-[#2F67FA] transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {paginatedTransactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  onClick={() => handleTransactionClick(transaction)}
                  className="p-3 border border-gray-200 rounded-lg space-y-2 bg-white hover:border-[#2F67FA] hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm group-hover:text-[#2F67FA] transition-colors">{transaction.type}</p>
                      <span className={cn("text-xs px-2 py-1 rounded-full font-medium", getStatusColor(transaction.status))}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                      <Receipt className="w-4 h-4 text-gray-400 group-hover:text-[#2F67FA] transition-colors" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Amount</p>
                      <p className="font-semibold text-foreground text-sm">
                        ${transaction.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{transaction.wallet}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Reference</p>
                      <p className="text-xs font-mono text-gray-600 break-all">{transaction.reference}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 text-center md:text-left">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </p>
                <div className="flex gap-1 md:gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] px-2 md:px-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let page;
                      if (totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        page = totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={page}
                          size="sm"
                          variant={currentPage === page ? "default" : "outline"}
                          onClick={() => setCurrentPage(page)}
                          className={
                            currentPage === page
                              ? "bg-[#2F67FA] hover:bg-[#2F67FA]/90 text-white px-2 md:px-3"
                              : "text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] px-2 md:px-3"
                          }
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] px-2 md:px-3"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
      
      {/* Receipt Modal */}
      <TransactionReceiptModal
        transaction={selectedTransaction}
        isOpen={isReceiptModalOpen}
        onClose={handleCloseReceiptModal}
      />
    </div>
  )
}
