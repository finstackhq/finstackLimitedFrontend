import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageCircle, Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
          <img
            src="/hero-background.png"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-xl rounded-[2rem] p-8 md:p-12">
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-primary font-semibold">
                Get in touch
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Contact Us
              </h1>
              <p className="text-base md:text-lg text-slate-600">
                We&apos;re here to help. Reach out via WhatsApp, email, or join our community group.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <MessageCircle size={24} />
                  <div>
                    <p className="font-semibold text-slate-900">WhatsApp</p>
                    <p className="text-sm text-slate-600">Chat with support directly</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/2348164458437"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium text-lg"
                >
                  +234 816 445 8437
                </a>
              </div>

              <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-slate-50 p-6 shadow-sm">
                <div className="flex items-center gap-3 text-primary">
                  <Mail size={24} />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <p className="text-sm text-slate-600">Send us a message anytime</p>
                  </div>
                </div>
                <a
                  href="mailto:hello@usefinstack.co"
                  className="text-primary hover:underline font-medium text-lg"
                >
                  hello@usefinstack.co
                </a>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <MessageCircle size={24} className="text-primary mt-1" />
                <div>
                  <p className="font-semibold text-slate-900 text-lg">Join our WhatsApp group</p>
                  <p className="text-sm text-slate-600">
                    To join our WhatsApp group, please open this link below.
                  </p>
                  <a
                    href="https://chat.whatsapp.com/IQgkct1WZa00XsyGacfs0Q?s=cl&p=a&mlu=4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-primary font-medium hover:underline break-words"
                  >
                    https://chat.whatsapp.com/IQgkct1WZa00XsyGacfs0Q?s=cl&p=a&mlu=4
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
              <Button
                asChild
                className="rounded-full px-7 py-3 bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
              >
                <a href="/" className="flex items-center gap-2">
                  <ArrowRight size={16} />
                  Back to Home
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
