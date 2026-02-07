"use client"

import { useState, useCallback } from "react"
import { useAccount, useBalance, useChainId } from "wagmi"
import { formatUnits } from "viem"

interface Token {
  id: string
  symbol: string
  name: string
  chain: string
  chainId: number
  balance: string
  usdValue: number
  icon: string
  decimals: number
}

interface SwapWidgetProps {
  onSwapComplete?: (amount: number) => void
  className?: string
}

const MOCK_TOKENS: Token[] = [
  { id: "pol", symbol: "POL", name: "Polygon Ecosystem Token", chain: "Polygon", chainId: 137, balance: "16.17354", usdValue: 1.92, icon: "POL", decimals: 18 },
  { id: "usdc", symbol: "USDC", name: "USD Coin", chain: "Polygon", chainId: 137, balance: "0.005361", usdValue: 6.01, icon: "USDC", decimals: 6 },
  { id: "eth-arb", symbol: "ETH", name: "Ethereum", chain: "Arbitrum", chainId: 42161, balance: "0.0156", usdValue: 52.40, icon: "ETH", decimals: 18 },
  { id: "usdc-arb", symbol: "USDC", name: "USD Coin", chain: "Arbitrum", chainId: 42161, balance: "25.00", usdValue: 25.00, icon: "USDC", decimals: 6 },
]

const CHAIN_COLORS: Record<string, string> = {
  Polygon: "#8247E5",
  Arbitrum: "#28A0F0",
  Optimism: "#FF0420",
  Ethereum: "#627EEA",
  Base: "#0052FF",
}

export function SwapWidget({ onSwapComplete, className = "" }: SwapWidgetProps) {
  const [activeTab, setActiveTab] = useState<"swap" | "vaults" | "aave">("swap")
  const [receiveToken, setReceiveToken] = useState(MOCK_TOKENS[0])
  const [receiveAmount, setReceiveAmount] = useState("1.056314")
  const [selectedPayTokens, setSelectedPayTokens] = useState<Token[]>([MOCK_TOKENS[0], MOCK_TOKENS[1]])
  const [tokenSliders, setTokenSliders] = useState<Record<string, number>>({ pol: 55, usdc: 0 })
  const [showTokenSelector, setShowTokenSelector] = useState(false)

  const { address, isConnected } = useAccount()
  const chainId = useChainId()

  const calculateTotalPay = useCallback(() => {
    let total = 0
    for (const token of selectedPayTokens) {
      const percentage = tokenSliders[token.id] || 0
      total += (token.usdValue * percentage) / 100
    }
    return total
  }, [selectedPayTokens, tokenSliders])

  const handleSliderChange = (tokenId: string, value: number) => {
    setTokenSliders(prev => ({ ...prev, [tokenId]: value }))
  }

  const handleSwap = () => {
    const total = calculateTotalPay()
    onSwapComplete?.(total)
  }

  return (
    <div className={`neon-card rounded-2xl p-5 max-w-md w-full ${className}`}>
      {/* Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {(["swap", "vaults", "aave"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-sans text-lg capitalize transition-colors ${
                activeTab === tab 
                  ? "text-dust font-semibold" 
                  : "text-cosmic hover:text-dust"
              }`}
            >
              {tab === "aave" ? "Aave V3" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <button className="p-2 rounded-lg hover:bg-lunar/30 transition-colors">
          <SettingsIcon />
        </button>
      </div>

      {/* Receive Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-sm text-cosmic">Receive :</span>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-lunar/30 text-xs font-mono text-cosmic">
            <span className="w-3 h-3 rounded-full bg-signal" />
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0xd7A4...564C"}
          </button>
        </div>

        {/* Token Selector */}
        <button 
          onClick={() => setShowTokenSelector(!showTokenSelector)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-lunar/40 hover:bg-lunar/60 transition-colors mb-3"
        >
          <div className="w-6 h-6 rounded-full bg-signal/20 flex items-center justify-center">
            <span className="text-xs font-bold text-signal">{receiveToken.icon[0]}</span>
          </div>
          <span className="font-sans text-sm text-dust">axlUSDC</span>
          <ChevronDownIcon />
        </button>

        {/* Amount Display */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="font-sans text-3xl font-bold text-dust">{receiveAmount}</span>
          <span className="font-mono text-sm text-cosmic">axlUSDC</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-transmission">= $1.06</span>
            <span className="font-mono text-xs text-cosmic">($1.06/token)</span>
            <button className="px-2 py-0.5 rounded bg-transmission/20 text-transmission text-xs font-mono font-semibold">
              MAX
            </button>
          </div>
          <span className="font-mono text-sm text-cosmic">Balance 0</span>
        </div>
      </div>

      {/* Fee Display */}
      <div className="flex items-center justify-between py-3 border-t border-b border-lunar/30 mb-4">
        <span className="font-mono text-sm text-cosmic">Fee: $0.03</span>
        <div className="flex items-center gap-2">
          <ArrowUpDownIcon />
          <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-mars-rust/20 text-mars-rust text-xs font-mono">
            <span className="w-3 h-3 rounded-full bg-mars-rust" />
            $1.06
          </button>
        </div>
      </div>

      {/* Pay Section */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-mono text-sm text-cosmic">Pay :</span>
          <button className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-lunar/30 text-xs font-mono text-cosmic">
            <span className="w-3 h-3 rounded-full bg-signal" />
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0xd7A4...564C"}
          </button>
        </div>

        {/* Chain Pills */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <ChainPill chain="Polygon" active />
          <ChainPill chain="Arbitrum" amount="$4" />
          <ChainPill chain="Optimism" amount="$4" />
          <ChainPill chain="Ethereum" amount="$3" />
          <button className="px-3 py-1.5 rounded-full border border-dashed border-lunar text-cosmic text-xs font-mono hover:border-dust transition-colors">
            CLEAN
          </button>
        </div>

        {/* Token List with Sliders */}
        <div className="space-y-3">
          {selectedPayTokens.map((token) => (
            <TokenSliderCard
              key={token.id}
              token={token}
              percentage={tokenSliders[token.id] || 0}
              onPercentageChange={(value) => handleSliderChange(token.id, value)}
            />
          ))}
        </div>
      </div>

      {/* Swap Button */}
      <button 
        onClick={handleSwap}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8247E5] to-[#B066FF] text-white font-sans font-semibold text-lg hover:opacity-90 transition-opacity neon-button-purple"
      >
        Swap
      </button>
    </div>
  )
}

interface TokenSliderCardProps {
  token: Token
  percentage: number
  onPercentageChange: (value: number) => void
}

function TokenSliderCard({ token, percentage, onPercentageChange }: TokenSliderCardProps) {
  const usedAmount = (Number.parseFloat(token.balance) * percentage) / 100
  const usedUsdValue = (token.usdValue * percentage) / 100

  return (
    <div className="neon-card-inner rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${CHAIN_COLORS[token.chain]}20` }}
          >
            <span 
              className="text-sm font-bold"
              style={{ color: CHAIN_COLORS[token.chain] }}
            >
              {token.icon[0]}
            </span>
          </div>
          <div>
            <p className="font-sans font-semibold text-dust">{token.name}</p>
            <p className="font-mono text-xs text-cosmic">{token.symbol} - ${(token.usdValue / Number.parseFloat(token.balance)).toFixed(2)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-mono text-sm text-dust">{token.balance} <span className="text-cosmic">{token.symbol}</span></p>
          <p className="font-mono text-xs text-transmission">= ${token.usdValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Slider */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-xs text-cosmic">Using: {percentage}%</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-dust">{usedAmount.toFixed(6)} {token.symbol}</span>
            <span className="font-mono text-xs text-transmission">= ${usedUsdValue.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min="0"
            max="100"
            value={percentage}
            onChange={(e) => onPercentageChange(Number.parseInt(e.target.value))}
            className="slider-gradient w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3BFF8A 0%, #8247E5 ${percentage}%, #2D2D35 ${percentage}%, #2D2D35 100%)`
            }}
          />
          <button 
            onClick={() => onPercentageChange(100)}
            className="absolute right-0 top-4 px-2 py-0.5 rounded bg-[#8247E5]/20 text-[#8247E5] text-xs font-mono font-semibold hover:bg-[#8247E5]/30 transition-colors"
          >
            MAX
          </button>
        </div>
      </div>
    </div>
  )
}

function ChainPill({ chain, active = false, amount }: { chain: string; active?: boolean; amount?: string }) {
  const color = CHAIN_COLORS[chain] || "#627EEA"
  
  return (
    <button 
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all ${
        active 
          ? "bg-[#8247E5]/20 text-[#8247E5] border border-[#8247E5]/50" 
          : "bg-lunar/30 text-cosmic hover:bg-lunar/50"
      }`}
    >
      <span 
        className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {chain[0]}
      </span>
      {active ? chain : amount}
    </button>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic">
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

function ArrowUpDownIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic">
      <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  )
}
