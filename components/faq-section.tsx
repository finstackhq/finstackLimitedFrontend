import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import BlurText from "@/components/ui/blur-text"

export function FAQSection() {
  const faqs = [
    {
      question: "What makes Finstack different from traditional money transfer services?",
      answer:
        "Finstack eliminates hidden fees and slow transfers by offering seamless cross-border transactions with favorable exchange rates. It's built to be faster, more transparent, and more affordable than traditional banks or remittance services.",
    },
    {
      question: "Can I send money instantly with Finstack?",
      answer:
        "Yes. Finstack is designed for real-time transactions, so your money moves across borders quickly, ensuring recipients get access without long delays.",
    },
    {
      question: "Does Finstack support P2P transfers?",
      answer:
        "Absolutely. With Finstack's peer-to-peer system, you can send and receive money directly from other users worldwide, making it easy to move funds between individuals without middlemen.",
    },
    {
      question: "Is Finstack safe for international transfers?",
      answer:
        "Security is a core part of Finstack. Every transfer is encrypted and monitored for fraud, ensuring your money and personal data are always protected.",
    },
    {
      question: "Who should use Finstack?",
      answer:
        "Finstack is perfect for anyone who needs to send money abroad, whether it's families supporting loved ones, freelancers receiving international payments, or businesses handling cross-border transactions.",
    },
  ]

  return (
    <section id="faq" className="py-20 px-4 relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <BlurText
            text="Got questions? We've got answers."
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-center"
          />
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get quick answers to common questions about our service.
          </p>
        </div>
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left font-semibold hover:no-underline">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground pt-2">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA Button */}
        <div className="flex justify-center mt-12">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-4 text-lg font-semibold">
            <Link href="/login">
              Get Started Free
            </Link>
          </Button>
        </div>
      </div>
      {/* Decorative FAQ image bottom right */}
      <div className="hidden md:block pointer-events-none absolute bottom-0 right-0 z-0 w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80">
        <Image src="/faq.png" alt="FAQ Illustration" fill className="object-contain" />
      </div>
    </section>
  )
}
