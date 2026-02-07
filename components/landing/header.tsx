"use client"

import { ConnectButton } from "thirdweb/react"
import { client, chains } from "@/lib/config/thirdweb.config"

interface HeaderProps {
  onConnectClick?: () => void
}

export function Header({ onConnectClick }: HeaderProps = {}) {
  return (
    <header className="relative z-20 flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full bg-mars-rust animate-pulse-glow" />
          <div className="absolute inset-1 rounded-full bg-void flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-hal glow-hal" />
          </div>
        </div>
        <span className="font-sans text-xl font-bold tracking-tight text-dust">
          INTENTO
        </span>
      </div>

      {/* Nav Links + Connect */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#how-it-works"
            onClick={(e) => {
              e.preventDefault()
              document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })
            }}
            className="text-cosmic hover:text-dust transition-colors text-sm font-mono"
          >
            About
          </a>
          <a
            href="https://docs.intento.market"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cosmic hover:text-dust transition-colors text-sm font-mono"
          >
            Docs
          </a>
        </nav>

        <div onClick={onConnectClick}>
          <ConnectButton
            client={client}
            chains={chains}
            theme="dark"
            connectButton={{
              label: "Connect Wallet",
              style: {
                background: "#C45D3E",
                color: "#F5EDE0",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: "14px",
                borderRadius: "0.75rem",
                padding: "8px 20px",
                border: "none",
                transition: "all 0.3s ease",
              },
            }}
            connectModal={{
              title: "Welcome to Intento",
              size: "compact",
              showThirdwebBranding: false,
            }}
          />
        </div>
      </div>
    </header>
  )
}
