"use client"

import { useState, useEffect } from "react"
import { useActiveAccount } from "thirdweb/react"
import { StatsCards } from "./StatsCards"
import { ActivePositions } from "./ActivePositions"

export function DashboardMain() {
  const account = useActiveAccount()
  const [stats, setStats] = useState({
    usdcBalance: 12847,
    totalPnL: 3241,
    activePositions: 7,
    winRate: 68.5,
  })

  // In production, fetch real data from APIs
  useEffect(() => {
    if (!account?.address) return

    // Fetch USDC balance from Polygon
    // Fetch positions from Polymarket
    // Calculate P&L and win rate

    // For demo, using mock data
  }, [account])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#F5EDE0] font-sans mb-2">
          Trading Dashboard
        </h1>
        <p className="text-[#4A4A55] font-mono text-sm">
          Polymarket Auto-Trade System
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards
        usdcBalance={stats.usdcBalance}
        totalPnL={stats.totalPnL}
        activePositions={stats.activePositions}
        winRate={stats.winRate}
      />

      {/* Active Positions Table */}
      <ActivePositions userAddress={account?.address} />

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          title="Explore Markets"
          description="Browse prediction markets and find opportunities"
          action="View Markets"
          icon="📊"
        />
        <QuickActionCard
          title="Add Funds"
          description="Register new tokens for trading"
          action="Register Tokens"
          icon="💰"
        />
      </div>
    </div>
  )
}

interface QuickActionCardProps {
  title: string
  description: string
  action: string
  icon: string
}

function QuickActionCard({ title, description, action, icon }: QuickActionCardProps) {
  return (
    <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl p-6 hover:border-[#C45D3E]/40 transition-all duration-300">
      <div className="flex items-start gap-4">
        <div className="text-4xl">{icon}</div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#F5EDE0] font-sans mb-1">{title}</h3>
          <p className="text-sm text-[#4A4A55] mb-4">{description}</p>
          <button className="px-4 py-2 rounded-lg bg-[#C45D3E] hover:bg-[#D4714A] text-[#F5EDE0] font-sans font-semibold text-sm transition-all duration-200">
            {action}
          </button>
        </div>
      </div>
    </div>
  )
}
