"use client"

import React from "react"

import { useState } from "react"
import { DashboardLayout } from "./DashboardLayout"
import { DashboardMain } from "./DashboardMain"
import { Markets } from "./markets"
import { Portfolio } from "./portfolio"
import { TradeInterface } from "./trade-interface"
import { PolymarketMarket } from "@/lib/services/polymarket"

type View = "dashboard" | "markets" | "positions" | "history" | "wallet" | "settings"

export function Dashboard() {
  const [activeView, setActiveView] = useState<View>("dashboard")
  const [selectedMarket, setSelectedMarket] = useState<PolymarketMarket | null>(null)

  const handleSelectMarket = (market: PolymarketMarket) => {
    setSelectedMarket(market)
  }

  const handleBackToMarkets = () => {
    setSelectedMarket(null)
  }

  // If a market is selected, show trade interface without sidebar
  if (selectedMarket) {
    return <TradeInterface market={selectedMarket} onBack={handleBackToMarkets} />
  }

  return (
    <DashboardLayout activeView={activeView} onViewChange={setActiveView}>
      {activeView === "dashboard" && <DashboardMain />}
      {activeView === "markets" && <Markets onSelectMarket={handleSelectMarket} />}
      {activeView === "positions" && <Portfolio />}
      {activeView === "history" && <HistoryView />}
      {activeView === "wallet" && <WalletView />}
      {activeView === "settings" && <SettingsView />}
    </DashboardLayout>
  )
}

// Placeholder components for additional views
function HistoryView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#F5EDE0] font-sans">Trade History</h1>
      <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl p-8 text-center">
        <p className="text-[#4A4A55]">Trade history view coming soon</p>
      </div>
    </div>
  )
}

function WalletView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#F5EDE0] font-sans">Wallet</h1>
      <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl p-8 text-center">
        <p className="text-[#4A4A55]">Wallet management view coming soon</p>
      </div>
    </div>
  )
}

function SettingsView() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#F5EDE0] font-sans">Settings</h1>
      <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl p-8 text-center">
        <p className="text-[#4A4A55]">Settings view coming soon</p>
      </div>
    </div>
  )
}
