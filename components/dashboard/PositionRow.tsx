"use client"

export interface Position {
  id: string
  market: string
  side: "YES" | "NO"
  size: number
  avgPrice: number
  currentPrice: number
  pnl: number
  pnlPercent: number
}

interface PositionRowProps {
  position: Position
  onSelect?: (position: Position) => void
}

export function PositionRow({ position, onSelect }: PositionRowProps) {
  const isProfitable = position.pnl >= 0

  return (
    <tr
      onClick={() => onSelect?.(position)}
      className="border-b border-[#2D2D35] hover:bg-[#2D2D35]/30 transition-colors cursor-pointer"
    >
      {/* Market */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-[#F5EDE0]">{position.market}</span>
          <span className="text-xs text-[#4A4A55] font-mono mt-0.5">
            {position.size} shares
          </span>
        </div>
      </td>

      {/* Position (Side) */}
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
            position.side === "YES"
              ? "bg-[#3BFF8A]/20 text-[#3BFF8A] border border-[#3BFF8A]/30"
              : "bg-[#FF3B3B]/20 text-[#FF3B3B] border border-[#FF3B3B]/30"
          }`}
        >
          {position.side} × {position.size}
        </span>
      </td>

      {/* Avg Price */}
      <td className="px-4 py-4">
        <span className="text-sm font-mono text-[#F5EDE0]">
          {position.avgPrice.toFixed(2)}¢
        </span>
      </td>

      {/* Current Price */}
      <td className="px-4 py-4">
        <span className="text-sm font-mono text-[#F5EDE0]">
          {position.currentPrice.toFixed(2)}¢
        </span>
      </td>

      {/* P&L */}
      <td className="px-4 py-4">
        <div className="flex flex-col items-end">
          <span
            className={`text-sm font-bold font-mono ${
              isProfitable ? "text-[#3BFF8A]" : "text-[#FF3B3B]"
            }`}
          >
            {isProfitable ? "+" : ""}${Math.abs(position.pnl).toFixed(2)}
          </span>
          <span
            className={`text-xs font-mono ${
              isProfitable ? "text-[#3BFF8A]/70" : "text-[#FF3B3B]/70"
            }`}
          >
            {isProfitable ? "+" : ""}{position.pnlPercent.toFixed(1)}%
          </span>
        </div>
      </td>
    </tr>
  )
}
