import { Card } from "@/components/ui/card"
import { Star } from "lucide-react"
import Image from "next/image"
import BlurText from "@/components/ui/blur-text"

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex justify-center -space-x-4 mb-8">
            {["/Memoji-01.png", "/Memoji-02.png", "/Memoji-03.png", "/Memoji-04.png"].map(
              (src, i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-full bg-primary/20 border-4 border-white flex items-center justify-center overflow-hidden"
                >
                  <div className="relative w-14 h-14">
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`memoji-${i + 1}`}
                      fill
                      className="object-cover rounded-full"
                    />
                  </div>
                </div>
              ),
            )}
          </div>
          <div className="flex justify-center w-full">
            <BlurText
              text="Trusted by thousands worldwide."
              delay={150}
              animateBy="words"
              direction="top"
              className="text-4xl lg:text-5xl font-bold text-foreground mb-6 text-center"
            />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
            From everyday users to growing businesses, people rely on Finstack to move money securely and without
            hassle. Our community makes trust the standard.
          </p>
        </div>

        {/* Removed App Screenshots Grid - replaced by more testimonials below */}

        {/* Review Cards - expanded to 9 testimonials using memoji avatars and Nigerian names */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              rating: 5,
              text: "Finstack made sending money to family back home effortless and fast.",
              author: "Chinedu Okafor",
              role: "Entrepreneur",
              img: "/Memoji-05.png",
            },
            {
              rating: 5,
              text: "Excellent rates and a trustworthy platform for small businesses.",
              author: "Aisha Bello",
              role: "Small Business Owner",
              img: "/Memoji-06.png",
            },
            {
              rating: 5,
              text: "The verification was quick and support is always helpful.",
              author: "Ifeanyi Nnaji",
              role: "Freelancer",
              img: "/Memoji-07.png",
            },
            {
              rating: 5,
              text: "I trust Finstack for all my international transfers — seamless every time.",
              author: "Funke Adeyemi",
              role: "Trader",
              img: "/Memoji-08.png",
            },
            {
              rating: 5,
              text: "Great UX and clear fees. My business cashflow improved.",
              author: "Uchechi Eze",
              role: "Business Analyst",
              img: "/Memoji-09.png",
            },
            {
              rating: 5,
              text: "Fast, reliable, and secure — exactly what I needed.",
              author: "Emeka Obi",
              role: "Software Engineer",
              img: "/Memoji-10.png",
            },
            {
              rating: 5,
              text: "Customer service resolved my issue in minutes. Highly recommend.",
              author: "Zainab Musa",
              role: "Marketer",
              img: "/Memoji-11.png",
            },
            {
              rating: 5,
              text: "Transparent pricing and instant transfers have been a lifesaver.",
              author: "Tunde Balogun",
              role: "Consultant",
              img: "/Memoji-12.png",
            },
            {
              rating: 5,
              text: "I can now pay international suppliers without the usual headaches.",
              author: "Nneka Kalu",
              role: "Procurement Manager",
              img: "/Memoji-13.png",
            },
          ].map((review, index) => (
            <Card key={index} className="p-6 bg-white border-0 shadow-sm">
              <div className="flex items-center space-x-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 text-pretty">"{review.text}"</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 overflow-hidden relative">
                  <Image
                    src={review.img || "/placeholder.svg"}
                    alt={review.author}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{review.author}</div>
                  <div className="text-sm text-muted-foreground">{review.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
