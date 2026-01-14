"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import BlurText from "@/components/ui/blur-text"
import Link from "next/link"

export function HeroSection() {
  return (
    <section id="home" className="relative pt-28 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <img src="/hero-background.png" alt="" className="w-full h-full object-cover" />
      </div>
      <div className="max-w-7xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-6 md:gap-12 items-start lg:items-center">
          {/* Left Content */}
          <div className="space-y-6 flex flex-col items-start text-left px-4 sm:px-6 lg:px-0">
            <div className="space-y-4">
              <BlurText
                text="Move money without borders."
                delay={150}
                animateBy="words"
                direction="top"
                className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance text-left"
              />
              <p className="text-sm md:text-base text-muted-foreground leading-snug text-pretty max-w-prose">
                Finstack makes global transfers simple, instant, and stress-free. Send money across countries at
                unbeatable rates with security you can trust.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-4 text-lg font-semibold flex items-center gap-2">
                  <ArrowRight size={20} />
                  Get Started
                </Button>
              </Link>
              <Button
                variant="outline"
                className="rounded-full px-8 py-4 text-lg font-semibold flex items-center gap-2 bg-transparent"
              >
                About Us
              </Button>
            </div>
          </div>

          <div className="relative flex justify-center lg:justify-end px-4 sm:px-6 lg:px-0">
            <div className="relative mx-auto w-[260px] h-[420px] sm:w-[320px] sm:h-[480px] md:w-[480px] md:h-[640px] lg:w-[560px] lg:h-[760px] group">
              <img
                src="/hero.png"
                alt="Finstack Mobile App Interface"
                className="w-full h-full object-contain drop-shadow-2xl rounded-[40px] transition-all duration-300 group-hover:scale-105 group-hover:rotate-2"
              />
              <div className="absolute inset-0 rounded-[40px] bg-gradient-to-t from-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
