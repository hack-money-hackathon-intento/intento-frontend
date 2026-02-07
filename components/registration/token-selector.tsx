"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Address } from "thirdweb"
import { Balances, Token } from "@/models/balances"

export interface TokenSelection {
  chainId: number
  tokenAddress: string
  symbol: string
  amount: string
  enabled: boolean
  balance: bigint
  allowance: bigint
}

interface TokenSelectorProps {
  balances: Balances[]
  onSelectionChange: (selections: Record<string, TokenSelection[]>) => void
  spenderByChain: Record<number, Address>
}

const CHAIN_INFO: Record<number, { name: string; color: string; icon: string; emoji: string }> = {
  8453: { name: 'Base', color: '#0052FF', icon: '🔵', emoji: '🔵' },
  10: { name: 'Optimism', color: '#FF0420', icon: '🔴', emoji: '🔴' },
  137: { name: 'Polygon', color: '#8247E5', icon: '🟣', emoji: '🟣' }
}

export function TokenSelector({ balances, onSelectionChange, spenderByChain }: TokenSelectorProps) {
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())
  const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set([8453, 10, 137]))
  const [hasWaitedForBalances, setHasWaitedForBalances] = useState(false)
  const previousSelectionsRef = useRef<string>('')

  // Sort chains by order: Base, Optimism, Polygon
  const sortedBalances = useMemo(() => {
    const chainOrder = [8453, 10, 137]
    return [...balances].sort((a, b) =>
      chainOrder.indexOf(a.chainId) - chainOrder.indexOf(b.chainId)
    )
  }, [balances])

  // Wait 3 seconds before showing "No tokens found" message
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasWaitedForBalances(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Calculate totals per chain
  const chainTotals = useMemo(() => {
    const totals: Record<number, number> = {}
    sortedBalances.forEach(balance => {
      const total = balance.tokens.reduce((acc, token) => {
        const value = (Number(token.amount) * Number(token.priceUSD || 0)) / 10 ** token.decimals
        return acc + value
      }, 0)
      totals[balance.chainId] = total
    })
    return totals
  }, [sortedBalances])

  // Calculate total selected value
  const totalSelectedValue = useMemo(() => {
    let total = 0
    sortedBalances.forEach(balance => {
      balance.tokens.forEach(token => {
        const key = `${balance.chainId}-${token.address.toLowerCase()}`
        if (selectedTokens.has(key)) {
          const value = (Number(token.amount) * Number(token.priceUSD || 0)) / 10 ** token.decimals
          total += value
        }
      })
    })
    return total
  }, [sortedBalances, selectedTokens])

  // Toggle token selection
  const toggleToken = (chainId: number, tokenAddress: string) => {
    const key = `${chainId}-${tokenAddress.toLowerCase()}`
    setSelectedTokens(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  // Toggle all tokens in a chain
  const toggleChainTokens = (chainId: number, checked: boolean) => {
    const balance = sortedBalances.find(b => b.chainId === chainId)
    if (!balance) return

    setSelectedTokens(prev => {
      const next = new Set(prev)
      balance.tokens.forEach(token => {
        const key = `${chainId}-${token.address.toLowerCase()}`
        if (checked) {
          next.add(key)
        } else {
          next.delete(key)
        }
      })
      return next
    })
  }

  // Check if all tokens in a chain are selected
  const isChainFullySelected = (chainId: number) => {
    const balance = sortedBalances.find(b => b.chainId === chainId)
    if (!balance || balance.tokens.length === 0) return false
    return balance.tokens.every(token => {
      const key = `${chainId}-${token.address.toLowerCase()}`
      return selectedTokens.has(key)
    })
  }

  // Toggle chain expansion
  const toggleChainExpansion = (chainId: number) => {
    setExpandedChains(prev => {
      const next = new Set(prev)
      if (next.has(chainId)) {
        next.delete(chainId)
      } else {
        next.add(chainId)
      }
      return next
    })
  }

  // Notify parent of selection changes (with deduplication to prevent infinite loops)
  useEffect(() => {
    const selectionsByChain: Record<string, TokenSelection[]> = {}

    sortedBalances.forEach(balance => {
      const chainKey = String(balance.chainId)
      const chainSelections: TokenSelection[] = []

      balance.tokens.forEach(token => {
        const key = `${balance.chainId}-${token.address.toLowerCase()}`
        const isSelected = selectedTokens.has(key)

        chainSelections.push({
          chainId: balance.chainId,
          tokenAddress: token.address,
          symbol: token.symbol,
          amount: token.amount,
          enabled: isSelected,
          balance: BigInt(token.amount),
          allowance: BigInt(0) // Will be fetched by parent
        })
      })

      if (chainSelections.length > 0) {
        selectionsByChain[chainKey] = chainSelections
      }
    })

    // Serialize selections to compare with previous
    const selectionsKey = JSON.stringify(
      Object.entries(selectionsByChain).map(([chain, tokens]) => [
        chain,
        tokens.map(t => `${t.tokenAddress}:${t.enabled}`)
      ])
    )

    // Only notify parent if selections actually changed
    if (selectionsKey !== previousSelectionsRef.current) {
      previousSelectionsRef.current = selectionsKey
      onSelectionChange(selectionsByChain)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTokens, sortedBalances])

  if (sortedBalances.length === 0) {
    if (!hasWaitedForBalances) {
      // Still loading - show spinner
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-slate-400 mb-2">Loading balances...</p>
          <p className="text-slate-500 text-sm">Please wait while we fetch your tokens</p>
        </div>
      )
    } else {
      // Waited long enough and still no tokens - show empty state
      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <p className="text-white mb-2 font-medium">No tokens found</p>
          <p className="text-slate-500 text-sm mb-4">
            Your wallet doesn't have any tokens on supported chains (Base, Optimism, Polygon)
          </p>
          <p className="text-slate-600 text-xs">
            You can still proceed with registration, but you'll need tokens to participate in markets
          </p>
        </div>
      )
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-lg">Select Tokens to Enable</h3>
        <div className="text-sm text-slate-400">
          Total: <span className="text-white font-semibold">${totalSelectedValue.toFixed(2)}</span>
        </div>
      </div>

      {/* Chains */}
      <div className="flex flex-col gap-3">
        {sortedBalances.map(balance => {
          const chainInfo = CHAIN_INFO[balance.chainId]
          const isExpanded = expandedChains.has(balance.chainId)
          const isFullySelected = isChainFullySelected(balance.chainId)
          const hasTokens = balance.tokens.length > 0

          return (
            <div
              key={balance.chainId}
              className="bg-[#1A1A1F] border border-slate-800/50 rounded-xl overflow-hidden"
            >
              {/* Chain Header */}
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                   onClick={() => hasTokens && toggleChainExpansion(balance.chainId)}>
                <div className="flex items-center gap-3">
                  {/* Chain Icon */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{chainInfo?.emoji || '⚪'}</span>
                    <span className="text-white font-semibold">{chainInfo?.name || `Chain ${balance.chainId}`}</span>
                  </div>
                  <span className="text-slate-500 text-sm">({balance.tokens.length})</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Chain Total */}
                  <span className="text-white font-medium">
                    ${chainTotals[balance.chainId]?.toFixed(2) || '0.00'}
                  </span>

                  {/* Select All Checkbox */}
                  {hasTokens && (
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isFullySelected}
                        onChange={(e) => toggleChainTokens(balance.chainId, e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 appearance-none cursor-pointer
                                   checked:bg-[#C45D3E] checked:border-[#C45D3E] hover:border-slate-500 transition-all"
                      />
                      {isFullySelected && (
                        <svg
                          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}

                  {/* Expand Icon */}
                  {hasTokens && (
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Token List */}
              {isExpanded && hasTokens && (
                <div className="border-t border-slate-800/50">
                  {balance.tokens.map((token, idx) => {
                    const key = `${balance.chainId}-${token.address.toLowerCase()}`
                    const isSelected = selectedTokens.has(key)
                    const tokenAmount = Number(token.amount) / 10 ** token.decimals
                    const tokenValue = tokenAmount * Number(token.priceUSD || 0)

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 hover:bg-slate-800/20 transition-colors cursor-pointer"
                        onClick={() => toggleToken(balance.chainId, token.address)}
                      >
                        {/* Token Info */}
                        <div className="flex items-center gap-3">
                          {/* Token Icon */}
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-800">
                            {token.logoURI ? (
                              <Image
                                src={token.logoURI}
                                alt={token.symbol}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                                {token.symbol.slice(0, 2)}
                              </div>
                            )}
                          </div>

                          {/* Token Details */}
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{token.symbol}</span>
                            <span className="text-slate-400 text-sm">
                              {tokenAmount.toFixed(6)} {token.symbol}
                            </span>
                          </div>
                        </div>

                        {/* Token Value & Checkbox */}
                        <div className="flex items-center gap-4">
                          {/* Value */}
                          <div className="text-right">
                            <div className="text-white font-medium">
                              ${tokenValue.toFixed(2)}
                            </div>
                            {token.priceUSD && (
                              <div className="text-slate-500 text-xs">
                                @${Number(token.priceUSD).toFixed(4)}
                              </div>
                            )}
                          </div>

                          {/* Checkbox */}
                          <div className="relative" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleToken(balance.chainId, token.address)}
                              className="w-5 h-5 rounded border-2 border-slate-600 bg-slate-900 appearance-none cursor-pointer
                                         checked:bg-[#C45D3E] checked:border-[#C45D3E] hover:border-slate-500 transition-all"
                            />
                            {isSelected && (
                              <svg
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary Footer */}
      {selectedTokens.size > 0 && (
        <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#C45D3E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-white font-medium">
                {selectedTokens.size} token{selectedTokens.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="text-right">
              <div className="text-[#C45D3E] font-bold text-lg">
                ${totalSelectedValue.toFixed(2)}
              </div>
              <div className="text-slate-500 text-xs">
                Total value
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
