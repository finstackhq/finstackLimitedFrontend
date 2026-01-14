"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

const moneyQuotes = [
  "Money is a tool. Used properly it makes something beautiful; used wrong, it makes a mess.",
  "The stock market is filled with individuals who know the price of everything, but the value of nothing.",
  "An investment in knowledge pays the best interest.",
  "The best time to plant a tree was 20 years ago. The second best time is now.",
  "Don't save what is left after spending; spend what is left after saving.",
  "It's not how much money you make, but how much money you keep.",
  "Financial freedom is available to those who learn about it and work for it.",
  "The habit of saving is itself an education; it fosters every virtue.",
  "Wealth is the ability to fully experience life.",
  "Money grows on the tree of persistence.",
]

export function MoneyQuote() {
  const [quote, setQuote] = useState("")

  useEffect(() => {
    const randomQuote = moneyQuotes[Math.floor(Math.random() * moneyQuotes.length)]
    setQuote(randomQuote)
  }, [])

  return (
    <Card className="h-full p-3 md:p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-100 shadow-sm flex flex-col">
      <div className="flex items-start gap-2 flex-1">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-blue-900 mb-1">Daily Wisdom</h3>
          <p className="text-xs md:text-sm text-gray-700 italic leading-relaxed line-clamp-4">{quote}</p>
        </div>
      </div>
    </Card>
  )
}
