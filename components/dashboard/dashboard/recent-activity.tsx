"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Download } from "lucide-react"
import type { Transaction } from "@/lib/mock-api"
import { cn } from "@/lib/utils"
import jsPDF from "jspdf"
import Papa from "papaparse"

interface RecentActivityProps {
  transactions: Transaction[]
}

export function RecentActivity({ transactions }: RecentActivityProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50"
      case "Pending":
        return "text-yellow-600 bg-yellow-50"
      case "Failed":
        return "text-red-600 bg-red-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("Recent Activity", 14, 20)
    doc.setFontSize(11)

    let yPos = 35
    transactions.forEach((transaction, index) => {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }
      doc.text(`${transaction.type} - ${transaction.status}`, 14, yPos)
      doc.text(`${transaction.wallet === "NGN" ? "₦" : "$"}${transaction.amount.toLocaleString()}`, 14, yPos + 5)
      doc.text(`${new Date(transaction.date).toLocaleDateString()} - ${transaction.reference}`, 14, yPos + 10)
      yPos += 20
    })

    doc.save("recent-activity.pdf")
  }

  const handleExportCSV = () => {
    const csvData = transactions.map((t) => ({
      Type: t.type,
      Status: t.status,
      Amount: t.amount,
      Currency: t.wallet,
      Date: new Date(t.date).toLocaleDateString(),
      Reference: t.reference,
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "recent-activity.csv"
    link.click()
  }

  return (
    <Card className="w-full p-4 md:p-6 shadow-lg border-gray-200">
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-lg md:text-xl font-semibold text-foreground">Recent Activity</h3>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportPDF}
            className="text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] bg-transparent text-xs md:text-sm"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            PDF
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            className="text-gray-600 hover:text-[#2F67FA] hover:border-[#2F67FA] bg-transparent text-xs md:text-sm"
          >
            <Download className="w-3 h-3 md:w-4 md:h-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="p-3 md:p-4 rounded-lg border border-gray-200 hover:border-[#2F67FA] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium text-foreground text-sm md:text-base">{transaction.type}</p>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 md:py-1 rounded-full font-medium",
                      getStatusColor(transaction.status),
                    )}
                  >
                    {transaction.status}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-gray-600">
                  {new Date(transaction.date).toLocaleDateString()} • {transaction.wallet}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground text-sm md:text-base">
                  {transaction.wallet === "NGN" ? "₦" : "$"}
                  {transaction.amount.toLocaleString()}
                </p>
                <p className="text-xs text-gray-600">{transaction.reference}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 md:mt-6 pt-4 border-t border-gray-200">
        <Button
          asChild
          variant="link"
          className="text-[#2F67FA] hover:text-[#2F67FA]/80 p-0 h-auto font-medium text-sm md:text-base"
        >
          <Link href="/dashboard/transactions" className="flex items-center gap-1">
            View All Transactions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </Card>
  )
}
