"use client"

import React from "react"

import { useState } from "react"
import { Coins, Zap, Target, Wallet } from "lucide-react"
import { useConnectModal } from "thirdweb/react"
import { client, chains } from "@/lib/config/thirdweb.config"
import { SplitFlapDisplay } from '@/components/animations/SplitFlapDisplay'

interface HeroSectionProps {
  onConnect: () => void
  onLearnMore: () => void
}

export function HeroSection({ onConnect, onLearnMore }: HeroSectionProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const { connect } = useConnectModal()

  const handleConnectClick = async () => {
    try {
      await connect({
        client,
        chains,
        theme: "dark",
        size: "compact",
        title: "Welcome to Intento",
        showThirdwebBranding: false,
      })
      // The useEffect in page.tsx will handle the redirection/onboarding
    } catch (error) {
      console.error("Connection failed", error)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#0A0A0C] overflow-hidden">
      {/* Split-Flap Display - Fixed side position */}
      <div className="hidden lg:flex fixed left-8 top-1/2 -translate-y-1/2 z-20">
        <SplitFlapDisplay 
          finalText="1NT3NT0" 
          interval={5000}
        />
      </div>

      <div className="relative flex-1 flex flex-col items-center text-center max-w-6xl mx-auto px-4 py-16 justify-center lg:pl-24">
        
        {/* Central Sphere with Orbital Lines */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          {/* Outer orbital rings */}
          <div className="absolute w-[500px] h-[500px] md:w-[700px] md:h-[700px] lg:w-[900px] lg:h-[900px]">
            {/* Ring 1 - Outermost */}
            <div 
              className="absolute inset-0 rounded-full border border-orange-500/10 animate-rotate-slower"
            />
            {/* Ring 2 */}
            <div 
              className="absolute inset-[60px] rounded-full border border-orange-500/15 animate-rotate-slow-reverse"
            />
            {/* Ring 3 */}
            <div 
              className="absolute inset-[120px] rounded-full border border-orange-500/10 animate-rotate-slow"
            />
            {/* Ring 4 - Inner */}
            <div 
              className="absolute inset-[180px] rounded-full border border-orange-500/20 animate-rotate-slow-reverse"
            />
          </div>
          
          {/* The Arbiter - Martian Mascot (self-animated GIF) */}
          <div className="arbiter-container">
            <div className="relative arbiter-mascot">
              {/* Dark sphere background with gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-900 via-slate-950 to-black sphere-glow" />

              {/* THE ARBITER - Animated Martian Octopus */}
              <div className="absolute inset-0 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src="/images/mascot/arbiter.gif"
                  alt="The Arbiter - INTENTO Martian Mascot"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Inner light reflection for depth */}
              <div className="absolute top-4 left-1/4 w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-full blur-xl pointer-events-none" />

              {/* Oxidized orange border ring (Mars theme) */}
              <div className="absolute inset-0 rounded-full border-2 border-orange-500/40 shadow-lg shadow-orange-500/20" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Main Headlines */}
          <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-none">
            <span className="text-white block mb-2">One Intent.</span>
            <span className="text-gradient-orange block mb-2 italic">Any Chain.</span>
            <span className="text-white block">Every Market.</span>
          </h1>

          {/* CTA Buttons - Movidos arriba para liberar vista del Arbiter */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12 mb-8">
            {/* Primary Button - Connect Wallet */}
            <button
              onClick={handleConnectClick}
              className="btn-shimmer relative px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-base rounded-xl transition-all duration-300 flex items-center gap-3 shadow-lg shadow-orange-500/25"
            >
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </button>

            {/* Secondary Button - Learn More (Glassmorphism) */}
            <button
              onClick={onLearnMore}
              className="px-8 py-4 glass-card text-slate-300 hover:text-white font-medium text-base rounded-xl transition-all duration-300"
            >
              Learn More
            </button>
          </div>

          {/* Supported Chains & Tokens - Ahora después de los botones */}
          <div className="flex flex-col items-center justify-center gap-4 mb-8">
            <span className="text-slate-500 text-sm font-mono">SUPPORTED CHAINS</span>
            <div className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
              <img src="/images/chains/ethereum.png" alt="Ethereum" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <img src="/images/chains/bnb.png" alt="BNB Chain" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <img src="/images/chains/optimism.png" alt="Optimism" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              <img src="/images/chains/tron.png" alt="Tron" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
            </div>
            <div className="flex items-center gap-4 mt-2 opacity-60 hover:opacity-90 transition-opacity">
              <span className="text-slate-600 text-xs font-mono">+</span>
              <img src="/images/tokens/usdc.png" alt="USDC" className="w-6 h-6 object-contain" />
              <img src="/images/tokens/pepe.png" alt="PEPE" className="w-6 h-6 object-contain" />
              <span className="text-slate-600 text-xs font-mono">& more</span>
            </div>
          </div>

          {/* Subtitle with backdrop blur - Movido debajo de logos */}
          <div className="mb-12 max-w-xl">
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed backdrop-blur-sm bg-slate-950/30 px-6 py-4 rounded-xl">
              Trade prediction markets with any token on any chain. No swaps. No bridges. No friction.
            </p>
          </div>

          {/* Stepper Cards - Al final */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 w-full max-w-3xl">
            {/* Step 1 - Any Token */}
            <StepCard
              icon={<Coins className="w-6 h-6" />}
              label="Any Token"
              isActive={false}
              isHovered={hoveredStep === 1}
              onMouseEnter={() => setHoveredStep(1)}
              onMouseLeave={() => setHoveredStep(null)}
            />
            
            {/* Connector Line */}
            <div className="hidden md:block w-12 h-px bg-gradient-to-r from-slate-700 to-orange-500/50" />
            
            {/* Step 2 - Intento (Active) */}
            <StepCard
              icon={<Zap className="w-6 h-6" />}
              label="Intento"
              isActive={true}
              isHovered={hoveredStep === 2}
              onMouseEnter={() => setHoveredStep(2)}
              onMouseLeave={() => setHoveredStep(null)}
            />
            
            {/* Connector Line */}
            <div className="hidden md:block w-12 h-px bg-gradient-to-r from-orange-500/50 to-slate-700" />
            
            {/* Step 3 - Position */}
            <StepCard
              icon={<Target className="w-6 h-6" />}
              label="Position"
              isActive={false}
              isHovered={hoveredStep === 3}
              onMouseEnter={() => setHoveredStep(3)}
              onMouseLeave={() => setHoveredStep(null)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface StepCardProps {
  icon: React.ReactNode
  label: string
  isActive: boolean
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

function StepCard({ icon, label, isActive, isHovered, onMouseEnter, onMouseLeave }: StepCardProps) {
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`
        relative px-6 py-4 rounded-2xl cursor-pointer
        transition-all duration-300 ease-out
        flex items-center gap-3
        ${isActive 
          ? 'bg-orange-600/20 border-2 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/20' 
          : 'glass-card text-slate-400'
        }
        ${isHovered && !isActive ? 'scale-105 border-slate-600' : ''}
      `}
    >
      <div className={`${isActive ? 'text-orange-400' : 'text-slate-500'}`}>
        {icon}
      </div>
      <span className={`font-medium ${isActive ? 'text-orange-300' : 'text-slate-300'}`}>
        {label}
      </span>
      {isActive && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
      )}
    </div>
  )
}