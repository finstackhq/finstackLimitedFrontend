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

  return (
    <div className="min-h-screen bg-white p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Help & Support</h1>
          <p className="text-gray-600">Find answers to common questions or contact our support team</p>
        </div>



        {/* Contact Cards */}
          <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <MessageCircle className="w-32 h-32 rotate-12" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left space-y-4 max-w-2xl">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Need Help? Chat with us</h3>
                </div>
                
                <p className="text-blue-100 text-lg leading-relaxed">
                  Our live chat feature is coming soon! In the meantime, our dedicated support team is ready to assist you via WhatsApp or Email.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <a 
                    href="https://wa.me/2348164458437" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-6 py-3 bg-white text-blue-700 rounded-full font-semibold hover:bg-blue-50 transition-colors shadow-sm w-full sm:w-auto justify-center"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.302-5.113c0-5.42 4.409-9.85 9.85-9.85 5.42 0 9.85 4.43 9.85 9.85 0 5.42-4.43 9.85-9.85 9.85M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10S6.486 2 12 2z"/></svg>
                    WhatsApp Support
                  </a>
                  <a 
                    href="mailto:hello@usefinstack.co"
                    className="flex items-center gap-3 px-6 py-3 bg-blue-800/50 backdrop-blur-sm text-white border border-blue-400/30 rounded-full font-semibold hover:bg-blue-800/70 transition-colors w-full sm:w-auto justify-center"
                  >
                    <Mail className="w-5 h-5" />
                    hello@usefinstack.co
                  </a>
                </div>
              </div>
            </div>
          </Card>

        {/* FAQs */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {faqs.map((category) => (
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
