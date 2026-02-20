import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-12 md:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
          <img
            src="/hero-background.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6 flex flex-col items-center text-center px-4 sm:px-6 lg:px-0">
              <h1 className="text-4xl md:text-5xl font-bold text-black mb-6">
                Contact Us
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-prose">
                Please contact support:
              </p>
              <div className="flex flex-col gap-6 w-full items-center">
                <div className="flex items-center gap-3 bg-white/80 border border-primary/10 rounded-xl px-6 py-4 shadow whitespace-nowrap overflow-x-auto">
                  <MessageCircle className="text-primary" />
                  <span className="font-semibold text-gray-800">Whatsapp:</span>
                  <a
                    href="https://wa.me/2348164458437"
                    target="_blank"
                    rel="noopener"
                    className="text-primary hover:underline font-medium whitespace-nowrap"
                  >
                    +234 816 445 8437
                  </a>
                </div>
                <div className="flex items-center gap-3 bg-white/80 border border-primary/10 rounded-xl px-6 py-4 shadow">
                  <Mail className="text-primary" />
                  <span className="font-semibold text-gray-800">Email:</span>
                  <a
                    href="mailto:hello@usefinstack.co"
                    className="text-primary hover:underline font-medium"
                  >
                    hello@usefinstack.co
                  </a>
                </div>
              </div>
              <div className="mt-8 w-full flex justify-center">
                <Button
                  asChild
                  className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <a href="/" className="flex items-center gap-2">
                    <ArrowRight size={16} />
                    Back to Home
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
