"use client"

import { DollarSign, TrendingUp, Activity, Target } from "lucide-react"

interface Stat {
  id: string
  label: string
  value: string
  change?: string
  isPositive?: boolean
  icon: React.ElementType
}

interface StatsCardsProps {
  usdcBalance?: number
  totalPnL?: number
  activePositions?: number
  winRate?: number
}

export function StatsCards({
  usdcBalance = 0,
  totalPnL = 0,
  activePositions = 0,
  winRate = 0,
}: StatsCardsProps) {
  const stats: Stat[] = [
    {
      id: "balance",
      label: "USDC Balance",
      value: `$${usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
    },
    {
      id: "pnl",
      label: "Total P&L",
      value: `${totalPnL >= 0 ? "+" : ""}$${Math.abs(totalPnL).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: totalPnL >= 0 ? "+12.5%" : "-8.2%",
      isPositive: totalPnL >= 0,
      icon: TrendingUp,
    },
    {
      id: "positions",
      label: "Active Positions",
      value: activePositions.toString(),
      icon: Activity,
    },
    {
      id: "winrate",
      label: "Win Rate",
      value: `${winRate.toFixed(1)}%`,
      icon: Target,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
}

interface StatCardProps {
  stat: Stat
}

function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon

  return (
    <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl p-6 hover:border-[#C45D3E]/40 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
          {stat.label}
        </span>
        <div className="w-8 h-8 rounded-lg bg-[#C45D3E]/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-[#C45D3E]" />
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div>
          <p
            className={`text-2xl font-bold font-sans ${
              stat.id === "pnl"
                ? stat.isPositive
                  ? "text-[#3BFF8A]"
                  : "text-[#FF3B3B]"
                : "text-[#F5EDE0]"
            }`}
          >
            {stat.value}
          </p>
          {stat.change && (
            <p
              className={`text-xs font-mono mt-1 ${
                stat.isPositive ? "text-[#3BFF8A]" : "text-[#FF3B3B]"
              }`}
            >
              {stat.change}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
