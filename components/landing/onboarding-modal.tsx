"use client"

import { useState } from "react"

interface OnboardingModalProps {
  onComplete: () => void
  onSkip: () => void
}

const ONBOARDING_STEPS = [
  {
    number: "01",
    title: "YOUR CAPITAL, UNIFIED",
    description: "See all your tokens across all chains in one view. No more fragmented portfolios.",
    icon: UnifiedIcon,
  },
  {
    number: "02",
    title: "EXPRESS YOUR INTENT",
    description: "Select your market, choose your position, set your size. That's it.",
    icon: IntentIcon,
  },
  {
    number: "03",
    title: "ONE SIGNATURE",
    description: "We handle swaps, bridges, and gas. You just sign once.",
    icon: SignatureIcon,
  },
  {
    number: "04",
    title: "POSITION ACQUIRED",
    description: "Your prediction market shares land directly in your wallet.",
    icon: PositionIcon,
  },
]

export function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const step = ONBOARDING_STEPS[currentStep]
  const StepIcon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-void/90 backdrop-blur-sm" onClick={onSkip} />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        {/* Gradient border effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-mars-rust via-oxidized to-terracotta rounded-sm opacity-50" />
        
        <div className="relative bg-crater rounded-sm p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={handleBack}
              className={`font-mono text-sm text-cosmic hover:text-dust transition-colors ${currentStep === 0 ? 'invisible' : ''}`}
            >
              Back
            </button>
            <button 
              onClick={onSkip}
              className="font-mono text-sm text-cosmic hover:text-dust transition-colors"
            >
              Skip to App
            </button>
          </div>

          {/* Content */}
          <div className="flex flex-col items-center text-center mb-8">
            {/* Icon */}
            <div className="w-20 h-20 rounded-full bg-mars-rust/20 flex items-center justify-center mb-6 border border-mars-rust/30">
              <StepIcon />
            </div>

            {/* Step number */}
            <div className="w-10 h-10 rounded-full bg-mars-rust flex items-center justify-center mb-4">
              <span className="font-mono text-sm font-bold text-pale">{step.number}</span>
            </div>

            {/* Title */}
            <h2 className="font-sans text-2xl font-bold text-dust mb-4 tracking-tight">
              {step.title}
            </h2>

            {/* Description */}
            <p className="font-mono text-sm text-cosmic leading-relaxed max-w-xs">
              {step.description}
            </p>
          </div>

          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {ONBOARDING_STEPS.map((_, index) => (
              <div
                key={index}
                className={`
                  w-2 h-2 rounded-full transition-all duration-300
                  ${index === currentStep 
                    ? 'bg-mars-rust w-6' 
                    : index < currentStep 
                      ? 'bg-mars-rust' 
                      : 'bg-lunar'
                  }
                `}
              />
            ))}
          </div>

          {/* Continue button */}
          <button
            onClick={handleNext}
            className="w-full py-4 bg-mars-rust text-pale font-sans font-semibold rounded-sm hover:bg-oxidized transition-colors"
          >
            {currentStep === ONBOARDING_STEPS.length - 1 ? "Let's Go" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  )
}

function UnifiedIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mars-rust">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function IntentIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mars-rust">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  )
}

function SignatureIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mars-rust">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function PositionIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-mars-rust">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  )
}
