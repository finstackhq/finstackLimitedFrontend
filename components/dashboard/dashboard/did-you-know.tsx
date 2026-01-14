"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lightbulb, RefreshCw } from "lucide-react"

const facts = [
  "Compound interest can double your money in approximately 7-10 years with consistent returns.",
  "The average millionaire has 7 different income streams.",
  "Saving just $5 a day equals $1,825 per year - enough for an emergency fund.",
  "70% of lottery winners go bankrupt within 3-5 years.",
  "Starting to invest at 25 vs 35 can result in 2x more wealth by retirement.",
  "The S&P 500 has averaged about 10% annual returns over the past 90 years.",
  "Automating your savings increases the likelihood of reaching financial goals by 73%.",
  "Credit card debt costs Americans over $120 billion in interest annually.",
  "Having a budget can help you save 20% more money each month.",
  "Investing in yourself through education has the highest ROI of any investment.",
]

export function DidYouKnow() {
  const [currentFact, setCurrentFact] = useState(facts[Math.floor(Math.random() * facts.length)])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshFact = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const newFact = facts[Math.floor(Math.random() * facts.length)]
      setCurrentFact(newFact)
      setIsRefreshing(false)
    }, 300)
  }

  return (
    <Card className="h-full p-3 md:p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border-amber-100 shadow-sm flex flex-col">
      <div className="flex items-start justify-between gap-2 flex-1">
        <div className="flex items-start gap-2 flex-1">
          <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-semibold text-amber-900 mb-1">Did You Know?</h3>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed line-clamp-3">{currentFact}</p>
          </div>
        </div>
        <Button
          onClick={refreshFact}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-amber-100 flex-shrink-0"
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 text-amber-700 ${isRefreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>
    </Card>
  )
}
