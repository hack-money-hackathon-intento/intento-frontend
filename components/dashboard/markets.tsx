"use client"

import { useState } from "react"
import { useMarkets } from "@/lib/hooks/useMarkets"
import { polymarketService, PolymarketMarket } from "@/lib/services/polymarket"

interface MarketsProps {
  onSelectMarket: (market: PolymarketMarket) => void
}

const CATEGORIES = ["All", "Politics", "Crypto", "Economics", "Science", "Tech"]

export function Markets({ onSelectMarket }: MarketsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Fetch real Polymarket data with auto-refresh
  const { markets, loading, error, refetch } = useMarkets({
    limit: 20,
    category: selectedCategory.toLowerCase(),
    autoRefresh: true,
    refreshInterval: 30000 // Refresh every 30 seconds
  })

  const filteredMarkets = markets.filter(market => {
    const matchesSearch = market.question.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="card-neon p-6 border-hal/50 bg-hal/10">
          <div className="flex items-center gap-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-hal">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <div>
              <p className="font-sans font-semibold text-hal mb-1">Failed to load markets</p>
              <p className="font-mono text-sm text-cosmic">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="ml-auto px-4 py-2 bg-mars-rust text-pale font-sans font-medium rounded-sm hover:bg-oxidized transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans text-3xl font-bold text-dust mb-1">MARKETS</h1>
          <p className="font-mono text-sm text-cosmic">Browse prediction markets from Polymarket</p>
        </div>

        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-cosmic" />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-crater border border-lunar rounded-sm font-mono text-sm text-dust placeholder:text-cosmic focus:outline-none focus:border-mars-rust transition-colors"
          />
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`
              px-4 py-2 font-mono text-xs rounded-sm border transition-all duration-200
              ${selectedCategory === category 
                ? 'bg-mars-rust/20 border-mars-rust text-mars-rust' 
                : 'border-lunar text-cosmic hover:border-dust hover:text-dust'
              }
            `}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Trending label */}
      <div className="flex items-center gap-2">
        <FireIcon />
        <span className="font-sans font-semibold text-oxidized">TRENDING</span>
      </div>

      {/* Market Cards */}
      <div className="space-y-4">
        {loading ? (
          // Loading State
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card-neon p-6 animate-pulse">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="h-4 bg-lunar/30 rounded w-24" />
                    <div className="h-6 bg-lunar/30 rounded w-3/4" />
                    <div className="space-y-2">
                      <div className="h-3 bg-lunar/30 rounded w-full" />
                      <div className="h-3 bg-lunar/30 rounded w-full" />
                    </div>
                  </div>
                  <div className="h-10 bg-lunar/30 rounded w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          filteredMarkets.map((market) => (
            <MarketCard
              key={market.id}
              market={market}
              onSelect={() => onSelectMarket(market)}
            />
          ))
        )}
      </div>

      {!loading && filteredMarkets.length === 0 && (
        <div className="card-neon p-12 text-center">
          <p className="font-mono text-cosmic">No markets found matching your criteria</p>
          <button
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("All")
            }}
            className="mt-4 px-4 py-2 bg-mars-rust/20 border border-mars-rust text-mars-rust font-mono text-sm rounded-sm hover:bg-mars-rust/30 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}

interface MarketCardProps {
  market: PolymarketMarket
  onSelect: () => void
}

function MarketCard({ market, onSelect }: MarketCardProps) {
  // Parse prices from Polymarket format
  const { yes, no } = polymarketService.parsePrices(market.outcomePrices)
  const yesPercent = Math.round(yes * 100)
  const noPercent = Math.round(no * 100)

  // Format volume and date
  const formattedVolume = polymarketService.formatVolume(market.volume24hr)
  const formattedDate = polymarketService.formatDate(market.endDate)
  const displayCategory = polymarketService.mapCategory(market.category)

  return (
    <div className="card-neon p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex-1">
          {/* Category Badge */}
          <span className="inline-block px-2 py-1 font-mono text-xs text-cosmic bg-lunar/30 rounded-sm mb-3">
            {displayCategory}
          </span>

          {/* Question */}
          <h3 className="font-sans text-lg font-semibold text-dust mb-4 leading-relaxed">
            {market.question}
          </h3>

          {/* Probability Bar */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-transmission w-8">YES</span>
              <div className="flex-1 h-3 bg-lunar/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-transmission rounded-full transition-all duration-500"
                  style={{ width: `${yesPercent}%` }}
                />
              </div>
              <span className="font-mono text-sm text-dust w-10">{yesPercent}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm text-hal w-8">NO</span>
              <div className="flex-1 h-3 bg-lunar/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-hal rounded-full transition-all duration-500"
                  style={{ width: `${noPercent}%` }}
                />
              </div>
              <span className="font-mono text-sm text-dust w-10">{noPercent}%</span>
            </div>
          </div>
        </div>

        {/* Right side info + CTA */}
        <div className="flex flex-col items-start lg:items-end gap-4">
          <div className="flex flex-wrap gap-4 text-right">
            <div>
              <p className="font-mono text-xs text-cosmic">Volume</p>
              <p className="font-sans font-semibold text-dust">{formattedVolume}</p>
            </div>
            <div>
              <p className="font-mono text-xs text-cosmic">Ends</p>
              <p className="font-sans font-semibold text-dust">{formattedDate}</p>
            </div>
          </div>

          <button
            onClick={onSelect}
            className="px-6 py-3 bg-mars-rust text-pale font-sans font-semibold rounded-sm hover:bg-oxidized transition-colors flex items-center gap-2"
          >
            Take Position
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </div>
  )
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  )
}

function FireIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-oxidized">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}
