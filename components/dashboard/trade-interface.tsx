"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useAccount } from "wagmi"
import { PolymarketMarket, polymarketService } from "@/lib/services/polymarket"
import { useLiFi } from "@/lib/hooks/li-fi"

interface TradeInterfaceProps {
  market: PolymarketMarket
  onBack: () => void
}

interface Token {
  id: string
  symbol: string
  name: string
  chain: string
  chainId: number
  address: string
  balance: string
  rawBalance: bigint
  decimals: number
  usdValue: number
  priceUSD: number
  icon: string
  logoURI?: string
  color: string
}

const CHAIN_INFO: Record<number, { name: string, color: string }> = {
  1: { name: "Ethereum", color: "#627EEA" },
  10: { name: "Optimism", color: "#FF0420" },
  42161: { name: "Arbitrum", color: "#28A0F0" },
  137: { name: "Polygon", color: "#8247E5" },
  8453: { name: "Base", color: "#0052FF" },
  43114: { name: "Avalanche", color: "#E84142" },
}

export function TradeInterface({ market, onBack }: TradeInterfaceProps) {
  const { useBalances } = useLiFi()
  const { data: rawBalances, isLoading } = useBalances()
  
  const [selectedPosition, setSelectedPosition] = useState<"yes" | "no">("yes")
  const [selectedTokenIds, setSelectedTokenIds] = useState<Set<string>>(new Set())
  const [hasInitializedTokens, setHasInitializedTokens] = useState(false)
  const [tokenSliders, setTokenSliders] = useState<Record<string, number>>({})
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState<"trade" | "swap" | "bridge">("trade")

  const { address } = useAccount()

  // Map real balances to UI tokens
  const availableTokens = useMemo(() => {
    if (!rawBalances) return []
    
    const tokens: Token[] = []
    rawBalances.forEach(chain => {
      chain.tokens.forEach(token => {
        const chainInfo = CHAIN_INFO[chain.chainId] || { name: `Chain ${chain.chainId}`, color: "#CCCCCC" }
        const rawAmount = BigInt(token.amount)
        const balanceValue = (Number(rawAmount) / Math.pow(10, token.decimals))
        const usdValue = balanceValue * Number(token.priceUSD || 0)
        
        if (usdValue > 0.01) { // Filter dust
          tokens.push({
            id: `${chain.chainId}-${token.address}`,
            symbol: token.symbol,
            name: token.name,
            chain: chainInfo.name,
            chainId: chain.chainId,
            address: token.address,
            balance: balanceValue.toFixed(6),
            rawBalance: rawAmount,
            decimals: token.decimals,
            usdValue,
            priceUSD: Number(token.priceUSD || 0),
            icon: (token as any).logoURI || token.symbol[0],
            logoURI: (token as any).logoURI,
            color: chainInfo.color
          })
        }
      })
    })
    return tokens.sort((a, b) => b.usdValue - a.usdValue)
  }, [rawBalances])

  // Auto-initialize selected tokens once discovered
  useEffect(() => {
    if (availableTokens.length > 0 && !hasInitializedTokens) {
      const topTokenIds = availableTokens.slice(0, 2).map(t => t.id)
      setSelectedTokenIds(new Set(topTokenIds))
      
      const initialSliders: Record<string, number> = {}
      topTokenIds.forEach(id => {
        initialSliders[id] = 50 // Default to 50%
      })
      setTokenSliders(initialSliders)
      setHasInitializedTokens(true)
    }
  }, [availableTokens, hasInitializedTokens])

  const selectedTokens = useMemo(() => 
    availableTokens.filter(t => selectedTokenIds.has(t.id)),
  [availableTokens, selectedTokenIds])

  // Parse prices from Polymarket format
  const { yes: yesPrice, no: noPrice } = polymarketService.parsePrices(market.outcomePrices)
  const price = selectedPosition === "yes" ? yesPrice : noPrice
  
  const totalAmount = useCallback(() => {
    let total = 0
    for (const token of selectedTokens) {
      const percentage = tokenSliders[token.id] || 0
      total += (token.usdValue * percentage) / 100
    }
    return total
  }, [selectedTokens, tokenSliders])

  const amount = totalAmount()
  const shares = price > 0 ? amount / price : 0
  const potentialPayout = shares
  const potentialProfit = potentialPayout - amount
  const profitPercent = amount > 0 ? (potentialProfit / amount) * 100 : 0

  const handleSliderChange = (tokenId: string, value: number) => {
    setTokenSliders(prev => ({ ...prev, [tokenId]: value }))
  }

  const handleExecute = () => {
    setIsExecuting(true)
    setTimeout(() => {
      setIsExecuting(false)
      setShowSuccess(true)
    }, 3000)
  }

  const toggleTokenSelection = (token: Token) => {
    const next = new Set(selectedTokenIds)
    if (next.has(token.id)) {
      next.delete(token.id)
      setTokenSliders(prev => {
        const updated = { ...prev }
        delete updated[token.id]
        return updated
      })
    } else {
      next.add(token.id)
      setTokenSliders(prev => ({ ...prev, [token.id]: 0 }))
    }
    setSelectedTokenIds(next)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-t-2 border-mars-rust rounded-full animate-spin mx-auto mb-4" />
          <p className="font-mono text-cosmic">Fetching live balances...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void grain-overlay">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-lunar bg-void/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button
              onClick={onBack}
              className="flex items-center gap-2 font-mono text-sm text-cosmic hover:text-dust transition-colors"
            >
              <BackIcon />
              Back to Markets
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* Market Question */}
        <div className="mb-8">
          <span className="inline-block px-2 py-1 font-mono text-xs text-cosmic bg-lunar/30 rounded-sm mb-3">
            {market.category}
          </span>
          <h1 className="font-sans text-2xl md:text-3xl font-bold text-dust leading-relaxed">
            {market.question}
          </h1>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-lunar to-transparent mt-6" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Position Selection Card */}
          <div className="neon-card-mars rounded-2xl p-6">
            <h2 className="font-sans text-lg font-semibold text-dust mb-4">Select Position</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <PositionButton
                position="yes"
                price={yesPrice}
                selected={selectedPosition === "yes"}
                onClick={() => setSelectedPosition("yes")}
              />
              <PositionButton
                position="no"
                price={noPrice}
                selected={selectedPosition === "no"}
                onClick={() => setSelectedPosition("no")}
              />
            </div>

            {/* Payout Summary */}
            <div className="neon-card-inner rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-cosmic">YOU RECEIVE</span>
                <span className="font-sans text-lg font-semibold text-dust">
                  ~{shares.toFixed(1)} {selectedPosition.toUpperCase()} shares
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-cosmic">Price per share</span>
                <span className="font-mono text-sm text-dust">${price.toFixed(2)}</span>
              </div>
              <div className="w-full h-px bg-lunar my-3" />
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-cosmic">Potential Payout</span>
                <span className="font-sans font-semibold text-dust">${potentialPayout.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-cosmic">Potential Profit</span>
                <span className="font-sans font-semibold text-transmission">
                  +${potentialProfit.toFixed(2)} (+{profitPercent.toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Payment Card with Sliders */}
          <div className="neon-card rounded-2xl p-6">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              {(["trade", "swap", "bridge"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`font-sans text-sm capitalize transition-colors ${
                    activeTab === tab 
                      ? "text-dust font-semibold" 
                      : "text-cosmic hover:text-dust"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
              <button className="ml-auto p-2 rounded-lg hover:bg-lunar/30 transition-colors">
                <SettingsIcon />
              </button>
            </div>

            {/* Wallet Address */}
            <div className="flex items-center gap-2 mb-4">
              <span className="font-mono text-sm text-cosmic">Pay from:</span>
              <button className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-lunar/30 text-xs font-mono text-cosmic">
                <span className="w-3 h-3 rounded-full bg-signal" />
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "0xd7A4...564C"}
              </button>
            </div>

            {/* Chain Pills */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {Object.entries(CHAIN_INFO).map(([chainId, info]) => {
                const chainTokens = selectedTokens.filter(t => t.chainId === Number(chainId))
                const chainTotal = chainTokens.reduce((sum, t) => {
                  const percentage = tokenSliders[t.id] || 0
                  return sum + (t.usdValue * percentage) / 100
                }, 0)
                const hasTokens = availableTokens.some(t => t.chainId === Number(chainId))
                
                return hasTokens ? (
                  <ChainPill 
                    key={chainId}
                    chain={info.name} 
                    color={info.color}
                    amount={chainTotal > 0 ? `$${chainTotal.toFixed(0)}` : undefined}
                    active={chainTokens.length > 0}
                  />
                ) : null
              })}
              <button 
                onClick={() => setShowTokenSelector(!showTokenSelector)}
                className="px-3 py-1.5 rounded-full border border-dashed border-lunar text-cosmic text-xs font-mono hover:border-dust transition-colors"
              >
                + Add
              </button>
            </div>

            {/* Token Selector Dropdown */}
            {showTokenSelector && (
              <div className="mb-4 p-3 neon-card-inner rounded-xl">
                <p className="font-mono text-xs text-cosmic mb-3">Select tokens to use:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableTokens.map((token) => {
                    const isSelected = selectedTokenIds.has(token.id)
                    return (
                      <button
                        key={token.id}
                        onClick={() => toggleTokenSelection(token)}
                        className={`w-full p-3 rounded-lg text-left transition-colors flex items-center justify-between ${
                          isSelected ? 'bg-[#8247E5]/20 border border-[#8247E5]/50' : 'hover:bg-lunar/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden"
                            style={{ backgroundColor: `${token.color}20` }}
                          >
                            {token.icon.startsWith('http') ? (
                              <img src={token.icon} alt={token.symbol} className="w-full h-full object-cover" />
                            ) : (
                              <span style={{ color: token.color }} className="text-xs font-bold">{token.icon}</span>
                            )}
                          </div>
                          <div>
                            <p className="font-sans text-sm text-dust">{token.symbol}</p>
                            <p className="font-mono text-xs text-cosmic">{token.chain}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-sm text-dust">{token.balance}</p>
                          <p className="font-mono text-xs text-transmission">${token.usdValue.toFixed(2)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Token Sliders */}
            <div className="space-y-3 mb-6">
              {selectedTokens.map((token) => (
                <TokenSliderCard
                  key={token.id}
                  token={token}
                  percentage={tokenSliders[token.id] || 0}
                  onPercentageChange={(value) => handleSliderChange(token.id, value)}
                />
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between py-3 border-t border-lunar/30 mb-4">
              <span className="font-mono text-sm text-cosmic">Total</span>
              <span className="font-sans text-xl font-bold text-dust">${amount.toFixed(2)}</span>
            </div>

            {/* Execute Button */}
            <button
              onClick={handleExecute}
              disabled={amount <= 0}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-mars-rust to-oxidized text-pale font-sans font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed neon-button-purple"
              style={{
                background: 'linear-gradient(to right, #C45D3E, #D4714A)',
                boxShadow: '0 0 15px rgba(196, 93, 62, 0.4), 0 0 30px rgba(196, 93, 62, 0.2), 0 4px 15px rgba(0, 0, 0, 0.3)'
              }}
            >
              Execute Trade
            </button>

            {/* Route */}
            <div className="mt-4 text-center">
              <p className="font-mono text-xs text-cosmic">
                Route: Multi-chain → USDC → Bridge → Polygon → PM
              </p>
            </div>
          </div>
        </div>
      </main>
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
            className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
            style={{ backgroundColor: `${token.color}20` }}
          >
            {token.icon.startsWith('http') ? (
              <img src={token.icon} alt={token.symbol} className="w-full h-full object-cover" />
            ) : (
              <span 
                className="text-sm font-bold"
                style={{ color: token.color }}
              >
                {token.icon[0]}
              </span>
            )}
          </div>
          <div>
            <p className="font-sans font-semibold text-dust">{token.name}</p>
            <p className="font-mono text-xs text-cosmic">{token.symbol} - {token.chain}</p>
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

function ChainPill({ chain, color, active = false, amount }: { chain: string; color: string; active?: boolean; amount?: string }) {
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
      {amount || chain.slice(0, 3)}
    </button>
  )
}

interface PositionButtonProps {
  position: "yes" | "no"
  price: number
  selected: boolean
  onClick: () => void
}

function PositionButton({ position, price, selected, onClick }: PositionButtonProps) {
  const isYes = position === "yes"

  return (
    <button
      onClick={onClick}
      className={`
        p-6 rounded-xl border-2 transition-all duration-300
        ${selected
          ? isYes 
            ? 'border-transmission bg-transmission/10 shadow-[0_0_20px_rgba(59,255,138,0.3)]' 
            : 'border-hal bg-hal/10 shadow-[0_0_20px_rgba(255,59,59,0.3)]'
          : 'border-lunar hover:border-dust neon-card-inner'
        }
      `}
    >
      <p className={`font-sans text-2xl font-bold mb-2 ${isYes ? 'text-transmission' : 'text-hal'}`}>
        {position.toUpperCase()}
      </p>
      <p className="font-mono text-lg text-dust">${price.toFixed(2)}</p>
      {selected && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isYes ? 'bg-transmission' : 'bg-hal'} animate-pulse`} />
          <span className="font-mono text-xs text-cosmic">Selected</span>
        </div>
      )}
    </button>
  )
}

function TransactionProgress() {
  return (
    <div className="min-h-screen bg-void grain-overlay flex items-center justify-center">
      <div className="max-w-md w-full mx-4 neon-card rounded-2xl p-8 text-center">
        <h2 className="font-sans text-2xl font-bold text-dust mb-8">EXECUTING YOUR INTENT</h2>
        
        {/* Progress steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <StepIndicator status="complete" label="Swap" />
          <div className="w-8 h-0.5 bg-mars-rust" />
          <StepIndicator status="active" label="Bridge" />
          <div className="w-8 h-0.5 bg-lunar" />
          <StepIndicator status="pending" label="Position" />
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <p className="font-mono text-sm text-dust mb-2">Step 2 of 3: Bridging to Polygon</p>
          <div className="w-full h-2 bg-lunar rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-transmission to-[#8247E5] rounded-full w-2/3 animate-pulse" />
          </div>
        </div>

        {/* Status list */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3">
            <CheckIcon className="text-transmission" />
            <span className="font-mono text-sm text-dust">Swapped multi-chain tokens → USDC</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border-2 border-mars-rust animate-spin border-t-transparent" />
            <span className="font-mono text-sm text-cosmic">Bridging USDC via CCTP...</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full border border-lunar" />
            <span className="font-mono text-sm text-cosmic">Creating position on Polymarket</span>
          </div>
        </div>

        <p className="font-mono text-xs text-cosmic mt-6">Estimated: ~2 minutes remaining</p>
      </div>
    </div>
  )
}

interface StepIndicatorProps {
  status: "complete" | "active" | "pending"
  label: string
}

function StepIndicator({ status, label }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`
        w-10 h-10 rounded-full flex items-center justify-center
        ${status === "complete" ? 'bg-transmission shadow-[0_0_15px_rgba(59,255,138,0.5)]' : status === "active" ? 'bg-mars-rust animate-pulse shadow-[0_0_15px_rgba(196,93,62,0.5)]' : 'bg-lunar'}
      `}>
        {status === "complete" ? (
          <CheckIcon className="text-void" />
        ) : (
          <div className={`w-2 h-2 rounded-full ${status === "active" ? 'bg-pale' : 'bg-cosmic'}`} />
        )}
      </div>
      <span className="font-mono text-xs text-cosmic">{label}</span>
    </div>
  )
}

interface SuccessViewProps {
  market: PolymarketMarket
  shares: number
  position: string
  amount: string
  onBack: () => void
}

function SuccessView({ market, shares, position, amount, onBack }: SuccessViewProps) {
  return (
    <div className="min-h-screen bg-void grain-overlay flex items-center justify-center">
      <div className="max-w-md w-full mx-4 neon-card rounded-2xl p-8 text-center" style={{
        borderColor: 'rgba(59, 255, 138, 0.3)',
        boxShadow: '0 0 20px rgba(59, 255, 138, 0.15), 0 0 40px rgba(59, 255, 138, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Success icon */}
        <div className="w-20 h-20 rounded-full bg-transmission/20 flex items-center justify-center mx-auto mb-6 border border-transmission/30 shadow-[0_0_30px_rgba(59,255,138,0.3)]">
          <CheckIcon className="text-transmission w-10 h-10" />
        </div>

        <h2 className="font-sans text-2xl font-bold text-dust mb-2">POSITION ACQUIRED</h2>
        <p className="font-mono text-sm text-cosmic mb-8">Your trade was executed successfully</p>

        {/* Position details */}
        <div className="neon-card-inner rounded-xl p-4 mb-6 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-cosmic">Shares</span>
            <span className="font-sans font-semibold text-dust">
              {shares.toFixed(1)} {position.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-cosmic">Cost</span>
            <span className="font-mono text-sm text-dust">${amount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-cosmic">Potential Payout</span>
            <span className="font-sans font-semibold text-transmission">${shares.toFixed(2)}</span>
          </div>
        </div>

        <p className="font-mono text-xs text-cosmic mb-6 line-clamp-2">{market.question}</p>

        {/* Links */}
        <div className="space-y-2 mb-8">
          <a href="#" className="flex items-center justify-between p-3 rounded-xl neon-card-inner hover:bg-lunar/30 transition-colors">
            <span className="font-mono text-sm text-dust">View on Polygonscan</span>
            <ExternalLinkIcon />
          </a>
          <a href="#" className="flex items-center justify-between p-3 rounded-xl neon-card-inner hover:bg-lunar/30 transition-colors">
            <span className="font-mono text-sm text-dust">View Position on Polymarket</span>
            <ExternalLinkIcon />
          </a>
        </div>

        <button
          onClick={onBack}
          className="w-full py-4 rounded-xl text-pale font-sans font-semibold hover:opacity-90 transition-opacity"
          style={{
            background: 'linear-gradient(to right, #C45D3E, #D4714A)',
            boxShadow: '0 0 15px rgba(196, 93, 62, 0.4), 0 0 30px rgba(196, 93, 62, 0.2)'
          }}
        >
          Explore More Markets
        </button>

        {/* Share buttons */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <button className="font-mono text-xs text-cosmic hover:text-dust transition-colors">
            Share on X
          </button>
          <span className="text-lunar">|</span>
          <button className="font-mono text-xs text-cosmic hover:text-dust transition-colors">
            Share on Warpcast
          </button>
        </div>
      </div>
    </div>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cosmic">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
    </svg>
  )
}
