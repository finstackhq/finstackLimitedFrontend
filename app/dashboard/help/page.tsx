"use client"

import { useState } from "react"
import { Search, MessageCircle, Phone, Mail, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

const faqs = [
  {
    category: "Account",
    questions: [
      {
        q: "How do I verify my account?",
        a: "Go to Settings > KYC Verification and upload your government-issued ID, proof of address, and a selfie. Verification typically takes 24-48 hours.",
      },
      {
        q: "How do I reset my password?",
        a: 'Click "Forgot Password" on the login page, enter your email, and follow the instructions sent to your inbox.',
      },
      {
        q: "Can I have multiple accounts?",
        a: "No, each user is allowed only one account per email address and phone number.",
      },
    ],
  },
  {
    category: "Deposits & Withdrawals",
    questions: [
      {
        q: "How long do deposits take?",
        a: "Bank transfers typically take 10-30 minutes. USDT deposits are confirmed within 5-15 minutes depending on network congestion.",
      },
      {
        q: "What are the withdrawal limits?",
        a: "Unverified accounts: ₦50,000/day. Verified accounts: ₦5,000,000/day. USDT withdrawals have no limits for verified users.",
      },
      {
        q: "Are there any fees?",
        a: "Deposits are free. Withdrawals have a flat fee of ₦100 for NGN and 1 USDT for crypto transfers.",
      },
    ],
  },
  {
    category: "P2P Trading",
    questions: [
      {
        q: "How does P2P trading work?",
        a: "P2P allows you to buy/sell crypto directly with other users. Select an offer, initiate a trade, and follow the payment instructions. Funds are held in escrow until both parties confirm.",
      },
      {
        q: "Is P2P trading safe?",
        a: "Yes, all trades use escrow protection. Funds are only released when both parties confirm the transaction.",
      },
      {
        q: "What payment methods are supported?",
        a: "Bank transfer, mobile money, and cash deposits are supported for P2P trades.",
      },
    ],
  },
  {
    category: "Security",
    questions: [
      {
        q: "How do I enable 2FA?",
        a: "Go to Settings > Security and enable Two-Factor Authentication using Google Authenticator or SMS.",
      },
      {
        q: "What if I lose my 2FA device?",
        a: "Contact support immediately with your account details and government ID for verification.",
      },
      {
        q: "Is my money safe?",
        a: "Yes, we use bank-grade encryption and store 95% of funds in cold storage. All accounts are insured up to ₦10,000,000.",
      },
    ],
  },
]

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">Find answers to common questions or contact our support team</p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 border-gray-200 focus:border-blue-600 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <Card className="p-6 border-gray-200 hover:border-blue-600 transition-colors cursor-pointer">
            <MessageCircle className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-3">Chat with our support team</p>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Start Chat <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Card>

          <Card className="p-6 border-gray-200 hover:border-blue-600 transition-colors cursor-pointer">
            <Mail className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Email Support</h3>
            <p className="text-sm text-gray-600 mb-3">support@finstack.com</p>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Send Email <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Card>

          <Card className="p-6 border-gray-200 hover:border-blue-600 transition-colors cursor-pointer">
            <Phone className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-medium text-gray-900 mb-1">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-3">+234 800 123 4567</p>
            <Button variant="link" className="p-0 h-auto text-blue-600 font-medium">
              Call Now <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Card>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>

          {filteredFaqs.length === 0 ? (
            <Card className="p-8 text-center border-gray-200">
              <p className="text-gray-600">No results found for "{searchQuery}"</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredFaqs.map((category) => (
                <div key={category.category}>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">{category.category}</h3>
                  <div className="space-y-2">
                    {category.questions.map((item, idx) => {
                      const itemId = `${category.category}-${idx}`
                      const isExpanded = expandedItems.has(itemId)

                      return (
                        <Card key={itemId} className="border-gray-200 overflow-hidden transition-all">
                          <button
                            onClick={() => toggleItem(itemId)}
                            className="w-full p-3 md:p-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-medium text-gray-900 text-sm md:text-base">{item.q}</span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 md:h-5 md:w-5 text-gray-400 flex-shrink-0" />
                            )}
                          </button>
                          {isExpanded && (
                            <div className="px-3 md:px-3.5 pb-3 md:pb-3.5 text-gray-600 text-sm md:text-base border-t border-gray-100 pt-3 md:pt-3.5">
                              {item.a}
                            </div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <Card className="mt-12 p-8 bg-blue-50 border-blue-100 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Still need help?</h3>
          <p className="text-gray-600 mb-4">Our support team is available 24/7 to assist you</p>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Contact Support</Button>
        </Card>
      </div>
    </div>
  )
}
