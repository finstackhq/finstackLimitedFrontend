import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { FAQSection } from "@/components/faq-section"
import BlurText from "@/components/ui/blur-text"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Target, Eye, ArrowRight } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img src="/hero-background.png" alt="" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-2xl">
            <div className="space-y-6 flex flex-col items-start text-left px-4 sm:px-6 lg:px-0">
              <div className="space-y-4">
                <BlurText
                  text="Redefining how the world moves money."
                  delay={150}
                  animateBy="words"
                  direction="top"
                  className="text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance text-left"
                />
                <p className="text-sm md:text-base text-muted-foreground leading-snug text-pretty max-w-prose">
                  We believe sending money shouldn't be complicated, expensive, or slow. Finstack was built to make global transfers simple, transparent, and reliable—whether you're sending to family, paying a freelancer, or handling business abroad.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission and Vision Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Our Mission Card */}
            <Card className="p-8 bg-white border border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To empower people everywhere to move money without borders. By combining fair exchange rates, instant transfers, and a trusted platform, we make global payments faster, easier, and more accessible.
                </p>
              </div>
            </Card>

            {/* Our Vision Card */}
            <Card className="p-8 bg-white border border-primary/20 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <Eye className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">Our Vision</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A world where anyone, from anywhere, can send and receive money with complete freedom—no hidden fees, no delays, and no limitations.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* How it all started Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="space-y-8">
            <BlurText
              text="How it all started"
              delay={150}
              animateBy="words"
              direction="top"
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6"
            />
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
              Finstack was founded with one question: Why does sending money across borders still feel complicated when technology has simplified everything else?
            </p>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
              We set out to build a platform designed for speed, transparency, and fairness—so individuals and businesses can send money worldwide with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
      
      <Footer />
    </div>
  )
}
