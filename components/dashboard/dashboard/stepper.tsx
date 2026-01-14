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
    <div className="w-full py-8">
      {/* Desktop: Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between max-w-3xl mx-auto">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                  currentStep > step.number
                    ? "bg-[#2F67FA] text-white"
                    : currentStep === step.number
                      ? "bg-[#2F67FA] text-white ring-4 ring-[#2F67FA]/20"
                      : "bg-gray-200 text-gray-600",
                )}
              >
                {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
              </div>
              <p
                className={cn(
                  "mt-2 text-sm font-medium transition-colors duration-300",
                  currentStep >= step.number ? "text-[#2F67FA]" : "text-gray-600",
                )}
              >
                {step.title}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-1 mx-4 relative">
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

      {/* Mobile: Vertical Stepper */}
      <div className="md:hidden space-y-4">
        {steps.map((step) => (
          <div key={step.number} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300",
                  currentStep > step.number
                    ? "bg-[#2F67FA] text-white"
                    : currentStep === step.number
                      ? "bg-[#2F67FA] text-white ring-4 ring-[#2F67FA]/20"
                      : "bg-gray-200 text-gray-600",
                )}
              >
                {currentStep > step.number ? <Check className="w-5 h-5" /> : step.number}
              </div>
              {step.number < steps.length && (
                <div className="w-1 h-12 mt-2 relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div
                    className={cn(
                      "absolute inset-0 bg-[#2F67FA] rounded-full transition-all duration-500",
                      currentStep > step.number ? "h-full" : "h-0",
                    )}
                  />
                </div>
              )}
            </div>
            <div className="pt-2">
              <p
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  currentStep >= step.number ? "text-[#2F67FA]" : "text-gray-600",
                )}
              >
                {step.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
