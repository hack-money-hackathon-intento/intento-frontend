"use client"

import { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"
import { PositionRow, Position } from "./PositionRow"

interface ActivePositionsProps {
  userAddress?: string
}

// Mock data for demo - in production, fetch from Polymarket API
const mockPositions: Position[] = [
  {
    id: "1",
    market: "Trump wins 2024",
    side: "YES",
    size: 500,
    avgPrice: 0.42,
    currentPrice: 0.58,
    pnl: 80,
    pnlPercent: 38.1,
  },
  {
    id: "2",
    market: "ETH > $4000",
    side: "NO",
    size: 250,
    avgPrice: 0.65,
    currentPrice: 0.71,
    pnl: -15,
    pnlPercent: -9.2,
  },
  {
    id: "3",
    market: "Fed cuts rates",
    side: "YES",
    size: 800,
    avgPrice: 0.35,
    currentPrice: 0.52,
    pnl: 136,
    pnlPercent: 48.6,
  },
]

export function ActivePositions({ userAddress }: ActivePositionsProps) {
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)

    // In production, fetch from Polymarket API:
    // const response = await fetch(`https://data-api.polymarket.com/positions?user=${userAddress}`)
    // const data = await response.json()
    // setPositions(data)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const handleSelectPosition = (position: Position) => {
    console.log("Selected position:", position)
    // In production, navigate to position detail page or open modal
  }

  if (positions.length === 0) {
    return (
      <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2D2D35] flex items-center justify-center">
            <svg
              className="w-8 h-8 text-[#4A4A55]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <p className="text-[#F5EDE0] font-medium mb-2">No active positions</p>
          <p className="text-[#4A4A55] text-sm">
            Start trading on prediction markets to see your positions here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1A1A1F] border border-[#2D2D35] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#2D2D35]">
        <h2 className="text-lg font-bold text-[#F5EDE0] font-sans">Active Positions</h2>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2D2D35] hover:bg-[#C45D3E]/20 text-[#F5EDE0] transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          <span className="text-sm font-mono">Refresh</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0A0A0C]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
                Market
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
                Position
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
                Avg
              </th>
              <th className="px-4 py-3 text-left text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
                Current
              </th>
              <th className="px-4 py-3 text-right text-xs font-mono text-[#4A4A55] uppercase tracking-wider">
                P&L
              </th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => (
              <PositionRow
                key={position.id}
                position={position}
                onSelect={handleSelectPosition}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-[#0A0A0C] border-t border-[#2D2D35]">
        <p className="text-xs text-[#4A4A55] font-mono">
          Showing {positions.length} active position{positions.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  )
}
