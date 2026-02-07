"use client"

import { SplitFlapDisplay } from '@/components/animations/SplitFlapDisplay'
import { ChevronDown } from "lucide-react"

export function HeroSection() {
  const handleScrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] bg-[#0A0A0C] overflow-hidden">
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

          {/* Subtitle tagline */}
          <div className="mt-12 mb-8 max-w-xl">
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed backdrop-blur-sm bg-slate-950/30 px-6 py-4 rounded-xl">
              Trade prediction markets with any token on any chain. No swaps. No bridges. No friction.
            </p>
          </div>

          {/* Supported Chains & Tokens */}
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

          {/* Learn More - smooth scroll */}
          <button
            onClick={handleScrollToHowItWorks}
            className="mt-4 flex flex-col items-center gap-2 text-cosmic hover:text-dust transition-colors group"
          >
            <span className="text-sm font-mono">Learn More</span>
            <ChevronDown className="w-5 h-5 animate-bounce group-hover:text-mars-rust" />
          </button>
        </div>
      </div>
    </div>
  )
}
