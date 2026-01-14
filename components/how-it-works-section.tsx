import { Button } from "@/components/ui/button"
import { CheckCircle, Search, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BlurText from "@/components/ui/blur-text"

export function HowItWorksSection() {
  const steps = [
    {
      number: "1",
      title: "Create & Verify",
      description: "Sign up in minutes, verify once, and unlock the marketplace.",
      icon: CheckCircle,
    },
    {
      number: "2",
      title: "Browse & Compare",
      description: "Explore live offers, check rates, and choose what works for you.",
      icon: Search,
    },
    {
      number: "3",
      title: "Exchange & Grow",
      description: "Trade securely, track transactions, and grow your digital value with ease.",
      icon: TrendingUp,
    },
  ]

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <BlurText
            text="Three simple steps. Endless opportunities."
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance text-center"
          />
        </div>

        <div className="space-y-20">
          {steps.map((step, index) => (
            <div key={step.number} className="grid lg:grid-cols-2 gap-8 md:gap-12 xl:gap-16 items-center max-w-6xl mx-auto">
              <div
                className={`space-y-6 flex flex-col items-center lg:items-start text-center lg:text-left px-4 sm:px-6 md:px-8 lg:px-0 ${index % 2 === 1 ? "lg:order-2" : ""}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.number}
                  </div>
                  <step.icon className="w-8 h-8 text-primary" />
                </div>

                <h3 className="text-3xl font-bold text-foreground text-balance">{step.title}</h3>

                <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-md">{step.description}</p>

                <Button asChild variant="outline" className="rounded-full bg-transparent">
                  <Link href="/login">
                    Get Started Today →
                  </Link>
                </Button>
              </div>

              <div className={`relative px-4 sm:px-6 md:px-8 lg:px-0 ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                <div className="relative mx-auto w-64 sm:w-80 md:w-96 h-64 sm:h-80 md:h-[500px]">
                  <div className="w-full h-full rounded-3xl border border-primary/20 overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6">
                    {/* inner box slightly smaller than container so image doesn't touch edges on mobile */}
                    <div className="relative w-[86%] h-[86%] sm:w-[90%] sm:h-[90%]">
                      {index === 0 && (
                        <Image src="/create.png" alt="Create" fill className="object-contain rounded-2xl" />
                      )}
                      {index === 1 && (
                        <Image src="/offer.png" alt="Offer" fill className="object-contain rounded-2xl" />
                      )}
                      {index === 2 && <Image src="/grow.png" alt="Grow" fill className="object-contain rounded-2xl" />}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
