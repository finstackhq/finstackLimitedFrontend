import BlurText from "@/components/ui/blur-text"
import MagicBento from "@/components/magic-bento"

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 md:py-20 bg-gray-900 overflow-x-hidden">
      <div className="max-w-7xl mx-auto w-full px-4">
        <div className="mb-8 md:mb-12">
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <span className="text-lg md:text-xl lg:text-2xl"></span>
            <span className="text-gray-300 font-medium text-xs md:text-sm lg:text-base"></span>
            <span className="text-lg md:text-xl lg:text-2xl">🇺🇸</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
            <div>
              <BlurText
                text="The Finstack Advantage."
                delay={150}
                animateBy="words"
                direction="top"
                className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 md:mb-6 text-balance leading-tight"
              />
            </div>
            <div className="lg:pt-4">
              <p className="text-sm md:text-lg lg:text-xl text-gray-300 text-pretty leading-relaxed">
                From real-time exchange rates to lightning-fast delivery, every feature is designed to make sending
                money across borders simple, secure, and cost-effective.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center items-center w-full">
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={250}
            particleCount={12}
            glowColor="47, 103, 250"
          />
        </div>
      </div>
    </section>
  )
}
