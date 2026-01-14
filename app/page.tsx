import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { HowItWorksSection } from "@/components/how-it-works-section"
import { GrowMoneySection } from "@/components/grow-money-section"
import { TestimonialsSection } from "@/components/testimonials-section"
import { FeaturedSection } from "@/components/featured-section"
import { FAQSection } from "@/components/faq-section"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GrowMoneySection />
      <TestimonialsSection />
      <FeaturedSection />
      <FAQSection />
      <Footer />
    </main>
  )
}
