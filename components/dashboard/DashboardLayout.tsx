"use client"

import { ReactNode } from "react"
import { Sidebar } from "./Sidebar"
import { useActiveAccount } from "thirdweb/react"
import { ConnectButton } from "thirdweb/react"
import { client, chains } from "@/lib/config/thirdweb.config"

interface DashboardLayoutProps {
  children: ReactNode
  activeView: string
  onViewChange: (view: string) => void
}

export function DashboardLayout({ children, activeView, onViewChange }: DashboardLayoutProps) {
  const account = useActiveAccount()
  const address = account?.address || ""
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "Not Connected"

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex">
      {/* Sidebar */}
      <Sidebar activeView={activeView} onViewChange={onViewChange} userAddress={address} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-[#0A0A0C] border-b border-[#2D2D35]">
          <div className="flex items-center justify-between px-6 py-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 rounded-full bg-[#C45D3E] animate-pulse" />
                <div className="absolute inset-1 rounded-full bg-[#0A0A0C] flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-[#FF3B3B]" />
                </div>
              </div>
              <span className="font-sans text-xl font-bold tracking-tight text-[#F5EDE0]">
                INTENTO
              </span>
            </div>

            {/* Right side - Wallet */}
            <div className="flex items-center gap-4">
              {address && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A1A1F] border border-[#2D2D35]">
                  <div className="h-2 w-2 rounded-full bg-[#3BFF8A] animate-pulse" />
                  <span className="font-mono text-xs text-[#F5EDE0]">{truncatedAddress}</span>
                </div>
              )}

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
                    borderRadius: "0.5rem",
                    padding: "8px 16px",
                  },
                }}
                detailsButton={{
                  style: {
                    background: "#C45D3E",
                    color: "#F5EDE0",
                  },
                }}
              />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
