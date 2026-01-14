"use client"

import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Step {
  number: number
  title: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-4">
      {/* Compact Horizontal Stepper for all screen sizes */}
      <div className="flex items-center justify-center">
        <div className="flex items-center justify-between w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto px-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300 text-xs md:text-sm",
                    currentStep > step.number
                      ? "bg-[#2F67FA] text-white"
                      : currentStep === step.number
                        ? "bg-[#2F67FA] text-white ring-2 md:ring-4 ring-[#2F67FA]/20"
                        : "bg-gray-200 text-gray-600",
                  )}
                >
                  {currentStep > step.number ? <Check className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" /> : step.number}
                </div>
                <p
                  className={cn(
                    "mt-1 md:mt-2 text-xs md:text-sm font-medium transition-colors duration-300 text-center max-w-[80px] md:max-w-none",
                    currentStep >= step.number ? "text-[#2F67FA]" : "text-gray-600",
                  )}
                >
                  {step.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 md:h-1 mx-1 md:mx-2 lg:mx-4 relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-[#2F67FA] rounded-full transition-all duration-500",
                      currentStep > step.number ? "w-full" : "w-0",
                    )}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
