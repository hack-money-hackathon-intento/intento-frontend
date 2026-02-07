"use client"

import React, { useMemo } from "react"
import { useLiFi } from "@/lib/hooks/li-fi"

interface BalanceOverviewProps {
  onExploreMarkets: () => void
}

const CHAIN_INFO: Record<number, { name: string, symbol: string, color: string, icon: React.FC }> = {
  1: { name: "Ethereum", symbol: "ETH", color: "#627EEA", icon: EthIcon },
  10: { name: "Optimism", symbol: "ETH", color: "#FF0420", icon: OpIcon },
  42161: { name: "Arbitrum", symbol: "ETH", color: "#28A0F0", icon: ArbIcon },
  137: { name: "Polygon", symbol: "POL", color: "#8247E5", icon: PolyIcon },
  8453: { name: "Base", symbol: "ETH", color: "#0052FF", icon: BaseIcon },
  43114: { name: "Avalanche", symbol: "AVAX", color: "#E84142", icon: AvaxIcon },
}

export function BalanceOverview({ onExploreMarkets }: BalanceOverviewProps) {
  const { useBalances } = useLiFi()
  const { data: rawBalances, isLoading } = useBalances()

  const chainBalances = useMemo(() => {
    if (!rawBalances) return []
    
    return rawBalances.map(chain => {
      const info = CHAIN_INFO[chain.chainId] || { 
        name: `Chain ${chain.chainId}`, 
        symbol: "???", 
        color: "#CCCCCC", 
        icon: EthIcon 
      }
      
      const totalUsdValue = chain.tokens.reduce((sum, token) => {
        const value = (Number(token.amount) / Math.pow(10, token.decimals)) * Number(token.priceUSD || 0)
        return sum + value
      }, 0)

      // Get the native token balance or the first one as representative
      const mainToken = chain.tokens[0]
      const balanceAmount = mainToken 
        ? (Number(mainToken.amount) / Math.pow(10, mainToken.decimals)).toFixed(4)
        : "0.00"

      return {
        id: chain.chainId.toString(),
        name: info.name,
        symbol: mainToken?.symbol || info.symbol,
        icon: info.icon,
        balance: balanceAmount,
        usdValue: totalUsdValue,
        change: 0, // Mock change for now
        color: info.color
      }
    }).filter(c => c.usdValue > 0.01).sort((a, b) => b.usdValue - a.usdValue)
  }, [rawBalances])

  const totalBalance = useMemo(() => 
    chainBalances.reduce((sum, chain) => sum + chain.usdValue, 0),
  [chainBalances])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 border-t-2 border-mars-rust rounded-full animate-spin mb-4" />
        <p className="font-mono text-cosmic">Scanning blockchains...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Total Balance */}
      <div className="text-center mb-12">
        <p className="font-mono text-sm text-cosmic mb-2">TOTAL BALANCE</p>
        <h1 className="font-sans text-5xl md:text-6xl font-bold text-dust mb-4">
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </h1>
        <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-mars-rust to-transparent mx-auto" />
      </div>

      {/* Chain Balance Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {chainBalances.length > 0 ? (
          chainBalances.map((chain) => (
            <ChainCard key={chain.id} chain={chain} />
          ))
        ) : (
          <div className="col-span-full text-center py-10 card-neon border-dashed">
            <p className="font-mono text-cosmic">No balances found on supported chains</p>
          </div>
        )}
      </div>

      {/* Additional chains indicator */}
      {chainBalances.length > 0 && (
        <div className="text-center">
          <p className="font-mono text-xs text-cosmic">
            Showing {chainBalances.length} chains with balances
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onExploreMarkets}
          className="px-8 py-4 bg-mars-rust text-pale font-sans font-semibold rounded-sm hover:bg-oxidized transition-all duration-300 glow-mars"
        >
          Explore Markets
        </button>
      </div>
    </div>
  )
}

interface ChainCardProps {
  chain: {
    id: string
    name: string
    symbol: string
    icon: React.FC
    balance: string
    usdValue: number
    change: number
    color: string
  }
}

function ChainCard({ chain }: ChainCardProps) {
  const ChainIcon = chain.icon
  const isPositive = chain.change >= 0

  return (
    <div className="group p-5 rounded-sm border border-lunar bg-crater hover:border-mars-rust/50 transition-all duration-300 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${chain.color}20` }}
          >
            <ChainIcon />
          </div>
          <div>
            <p className="font-sans font-semibold text-dust">{chain.name}</p>
            <p className="font-mono text-xs text-cosmic">{chain.symbol}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="font-sans text-2xl font-bold text-dust">
          ${chain.usdValue.toFixed(2)}
        </p>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs text-cosmic">
            {chain.balance} {chain.symbol}
          </p>
          <p className={`font-mono text-xs ${isPositive ? 'text-transmission' : 'text-hal'}`}>
            {isPositive ? '+' : ''}{chain.change.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Hover hint */}
      <div className="mt-4 pt-3 border-t border-lunar/50 opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="font-mono text-xs text-mars-rust">Use for trading</p>
      </div>
    </div>
  )
}

// Chain Icons
function EthIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#627EEA">
      <path d="M12 1.5l-9 13.5 9 5.25 9-5.25L12 1.5zm0 18.75L3 15l9 7.5 9-7.5-9 5.25z" />
    </svg>
  )
}

function OpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0420">
      <circle cx="12" cy="12" r="10" />
    </svg>
  )
}

function ArbIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#28A0F0">
      <path d="M12 2L2 19h20L12 2z" />
    </svg>
  )
}

function PolyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#8247E5">
      <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
    </svg>
  )
}

function BaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0052FF">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" stroke="white" strokeWidth="2" />
    </svg>
  )
}

function AvaxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#E84142">
      <path d="M12 2L2 19h6l4-8 4 8h6L12 2z" />
    </svg>
  )
}
