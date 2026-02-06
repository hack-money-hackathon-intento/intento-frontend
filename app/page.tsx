"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { HeroSection } from "@/components/landing/hero-section"
import { OnboardingModal } from "@/components/landing/onboarding-modal"
import { Dashboard } from "@/components/dashboard/dashboard"

export default function Home() {
  const account = useActiveAccount()
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  // Trigger onboarding only after connection
  useEffect(() => {
    if (account && !onboardingComplete) {
      setShowOnboarding(true)
    }
  }, [account, onboardingComplete])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setOnboardingComplete(true)
  }

  const handleSkipOnboarding = () => {
    setShowOnboarding(false)
    setOnboardingComplete(true)
  }

  if (account && onboardingComplete) {
    return <Dashboard />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Deep dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
      
      {/* Subtle radial glow from center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.08)_0%,_transparent_70%)]" />
      
      {/* Very subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-white font-semibold text-lg">Intento</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Markets</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Docs</a>
          <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">About</a>
        </nav>
      </header>

      {/* Main content */}
      <div className="relative z-10">
        <HeroSection 
          onConnect={() => {}} 
          onLearnMore={() => setShowOnboarding(true)} 
        />
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 border-t border-slate-800/50">
        <p className="text-slate-600 text-sm">
          Built for the multi-chain future
        </p>
      </footer>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal 
          onComplete={handleOnboardingComplete} 
          onSkip={handleSkipOnboarding}
        />
      )}
    </main>
  )
}
