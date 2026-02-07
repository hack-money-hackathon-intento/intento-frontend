"use client"

import { motion } from "framer-motion"
import { Wallet, Coins, Zap, TrendingUp } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Link your wallet from any supported chain. MetaMask, Coinbase, WalletConnect — we support them all.",
    icon: Wallet,
  },
  {
    number: "02",
    title: "Select Any Token",
    description: "Pick tokens from any chain — ETH, USDC, ARB, MATIC, or hundreds more. No need to swap first.",
    icon: Coins,
  },
  {
    number: "03",
    title: "We Swap, Bridge & Execute",
    description: "Intento handles all cross-chain routing, swaps, and bridging in a single intent. One signature.",
    icon: Zap,
  },
  {
    number: "04",
    title: "Position Live on Polymarket",
    description: "Your prediction market position is live. Track outcomes, manage risk, and collect winnings.",
    icon: TrendingUp,
  },
]

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-24 px-6 bg-[#0A0A0C]"
    >
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#C45D3E]/40 to-transparent" />

      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-mono text-xs text-[#C45D3E] tracking-widest uppercase">
            How It Works
          </span>
          <h2 className="font-sans text-3xl md:text-4xl font-bold text-[#F5EDE0] mt-3">
            From intent to position in four steps
          </h2>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="group relative p-6 rounded-xl border border-[#2D2D35] bg-[#1A1A1F]/80 hover:border-[#C45D3E]/40 transition-all duration-300"
            >
              {/* Step number */}
              <span className="font-mono text-xs text-[#4A4A55] mb-4 block">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-10 h-10 rounded-lg bg-[#C45D3E]/10 flex items-center justify-center mb-4 group-hover:bg-[#C45D3E]/20 transition-colors">
                <step.icon className="w-5 h-5 text-[#C45D3E]" />
              </div>

              {/* Title */}
              <h3 className="font-sans text-lg font-semibold text-[#F5EDE0] mb-2">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-[#4A4A55] leading-relaxed">
                {step.description}
              </p>

              {/* Connecting line (not on last item) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-[#2D2D35]" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
