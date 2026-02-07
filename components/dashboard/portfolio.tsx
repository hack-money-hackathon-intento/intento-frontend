"use client"

type Position = {
  id: string
  question: string
  position: "yes" | "no"
  shares: number
  avgPrice: number
  currentPrice: number
  value: number
  pnl: number
  pnlPercent: number
}

const MOCK_POSITIONS: Position[] = [
  {
    id: "1",
    question: "Will there be another US government shutdown by January 31?",
    position: "yes",
    shares: 73.5,
    avgPrice: 0.68,
    currentPrice: 0.72,
    value: 52.92,
    pnl: 5.88,
    pnlPercent: 12.5,
  },
  {
    id: "2",
    question: "Will Bitcoin exceed $100,000 by February 2025?",
    position: "yes",
    shares: 150,
    avgPrice: 0.45,
    currentPrice: 0.52,
    value: 78.00,
    pnl: 10.50,
    pnlPercent: 15.6,
  },
  {
    id: "3",
    question: "Will the Fed cut interest rates in Q1 2025?",
    position: "no",
    shares: 85,
    avgPrice: 0.59,
    currentPrice: 0.55,
    value: 46.75,
    pnl: -3.40,
    pnlPercent: -6.8,
  },
]

export function Portfolio() {
  const totalValue = MOCK_POSITIONS.reduce((sum, pos) => sum + pos.value, 0)
  const totalPnl = MOCK_POSITIONS.reduce((sum, pos) => sum + pos.pnl, 0)
  const totalPnlPercent = (totalPnl / (totalValue - totalPnl)) * 100

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-sans text-3xl font-bold text-dust mb-1">MY PORTFOLIO</h1>
        <div className="w-48 h-0.5 bg-gradient-to-r from-mars-rust to-transparent" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-6 rounded-sm border border-lunar bg-crater">
          <p className="font-mono text-xs text-cosmic mb-2">TOTAL VALUE</p>
          <p className="font-sans text-4xl font-bold text-dust">${totalValue.toFixed(2)}</p>
        </div>
        <div className="p-6 rounded-sm border border-lunar bg-crater">
          <p className="font-mono text-xs text-cosmic mb-2">UNREALIZED P&L</p>
          <p className={`font-sans text-4xl font-bold ${totalPnl >= 0 ? 'text-transmission' : 'text-hal'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}
          </p>
          <p className={`font-mono text-sm ${totalPnl >= 0 ? 'text-transmission' : 'text-hal'}`}>
            ({totalPnlPercent >= 0 ? '+' : ''}{totalPnlPercent.toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Active Positions */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="font-sans text-lg font-semibold text-dust">ACTIVE POSITIONS</h2>
          <span className="px-2 py-0.5 font-mono text-xs bg-mars-rust/20 text-mars-rust rounded-sm">
            {MOCK_POSITIONS.length}
          </span>
        </div>

        <div className="space-y-4">
          {MOCK_POSITIONS.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </div>
      </div>

      {/* Empty state (if no positions) */}
      {MOCK_POSITIONS.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-lunar/30 flex items-center justify-center mx-auto mb-4">
            <EmptyIcon />
          </div>
          <p className="font-sans text-lg text-dust mb-2">No active positions</p>
          <p className="font-mono text-sm text-cosmic">Start trading to see your positions here</p>
        </div>
      )}
    </div>
  )
}

interface PositionCardProps {
  position: Position
}

function PositionCard({ position }: PositionCardProps) {
  const isProfit = position.pnl >= 0
  const isYes = position.position === "yes"

  return (
    <div className="p-6 rounded-sm border border-lunar bg-crater hover:border-mars-rust/30 transition-all duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Position badge */}
          <span className={`
            inline-block px-2 py-1 font-mono text-xs rounded-sm mb-3
            ${isYes ? 'bg-transmission/20 text-transmission' : 'bg-hal/20 text-hal'}
          `}>
            {position.position.toUpperCase()}
          </span>

          {/* Question */}
          <h3 className="font-sans text-base font-semibold text-dust mb-3 leading-relaxed">
            {position.question}
          </h3>

          {/* Shares and price info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="font-mono text-xs text-cosmic">Shares: </span>
              <span className="font-mono text-dust">{position.shares.toFixed(1)}</span>
            </div>
            <div>
              <span className="font-mono text-xs text-cosmic">Avg: </span>
              <span className="font-mono text-dust">${position.avgPrice.toFixed(2)}</span>
            </div>
            <div>
              <span className="font-mono text-xs text-cosmic">Current: </span>
              <span className="font-mono text-dust">${position.currentPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Value and P&L */}
        <div className="flex flex-col items-start lg:items-end gap-2">
          <div className="text-right">
            <p className="font-mono text-xs text-cosmic">Value</p>
            <p className="font-sans text-2xl font-bold text-dust">${position.value.toFixed(2)}</p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-sm ${isProfit ? 'bg-transmission/10' : 'bg-hal/10'}`}>
            {isProfit ? <ArrowUpIcon className="text-transmission" /> : <ArrowDownIcon className="text-hal" />}
            <span className={`font-mono text-sm ${isProfit ? 'text-transmission' : 'text-hal'}`}>
              {isProfit ? '+' : ''}${position.pnl.toFixed(2)} ({isProfit ? '+' : ''}{position.pnlPercent.toFixed(1)}%)
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <button className="px-4 py-2 font-mono text-xs border border-lunar text-cosmic hover:border-dust hover:text-dust rounded-sm transition-colors">
              Sell
            </button>
            <button className="px-4 py-2 font-mono text-xs border border-mars-rust text-mars-rust hover:bg-mars-rust hover:text-pale rounded-sm transition-colors">
              Add More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  )
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cosmic">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  )
}
