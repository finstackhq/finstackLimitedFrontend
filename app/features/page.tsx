import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Globe, Zap, Shield, DollarSign, Clock, Headset } from "lucide-react"

export default function FeaturesPage() {
  const features = [
    {
      icon: Globe,
      title: "Global Reach",
      description: "Send money to over 180 countries with support for multiple currencies and payment methods.",
    },
    {
      icon: Zap,
      title: "Real-Time Rates",
      description: "Get the best exchange rates updated in real-time, ensuring you always get the most value.",
    },
    {
      icon: Shield,
      title: "Bank-Grade Security",
      description: "Your transactions are protected with enterprise-level encryption and security protocols.",
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Most transfers complete within minutes, not days. Experience the speed of modern finance.",
    },
    {
      icon: DollarSign,
      title: "Low Fees",
      description: "Transparent pricing with no hidden charges. Save up to 90% compared to traditional banks.",
    },
    {
      icon: Headset,
      title: "24/7 Customer Support",
      description: "Our dedicated support team is always available to help you with any questions or concerns.",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Our Features</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover why thousands of users trust Finstack for their international money transfers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-2xl p-8 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
