import { Card } from "@/components/ui/card"
import Image from "next/image"
import BlurText from "@/components/ui/blur-text"

export function GrowMoneySection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-center items-center mb-12">
          <BlurText
            text="Move Your Money Smarter"
            delay={150}
            animateBy="words"
            direction="top"
            className="text-4xl lg:text-6xl font-bold text-foreground text-center"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Card - Seamless Transfers */}
          <Card className="p-8 bg-white border-0 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Seamless
                <br />
                Transfers
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Send money across borders in minutes. No hidden fees, no long waits—just smooth, reliable transactions
                every time.
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="relative w-[80%] h-48">
                <Image
                  src="/transfer.png"
                  alt="Seamless Transfers Illustration"
                  width={400}
                  height={200}
                  className="object-contain"
                />
              </div>
            </div>
          </Card>

          {/* Center Card - Real-Time Rates */}
          <Card className="p-8 bg-white border-0 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div className="mb-8 flex justify-center">
              <div className="relative w-[80%] h-48">
                <Image
                  src="/rates.png"
                  alt="Real-Time Rates Illustration"
                  width={400}
                  height={200}
                  className="object-contain"
                />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                Real-Time
                <br />
                Rates
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Always get the best deal. Our system updates with live exchange rates, so you know exactly what you're
                sending and what your recipient gets.
              </p>
            </div>
          </Card>

          {/* Right Card - P2P Made Easy */}
          <Card className="p-8 bg-white border-0 shadow-sm flex flex-col justify-between min-h-[400px]">
            <div className="space-y-4">
              <h3 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight">
                P2P Made
                <br />
                Easy
              </h3>
              <p className="text-muted-foreground text-base leading-relaxed">
                Transfer money directly between people anywhere in the world. Secure, instant, and built for modern
                users who need fast access.
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="relative w-[80%] h-48">
                <Image
                  src="/p2p.png"
                  alt="P2P Transfer Illustration"
                  width={400}
                  height={200}
                  className="object-contain"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
