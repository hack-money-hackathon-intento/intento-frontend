'use client'

import { useConnect, useDisconnect, useAccount } from 'wagmi'
import { usePolymarket } from '@/lib/hooks/usePolymarket'

/**
 * Polymarket Connect Button
 * Shows connection status and allows users to connect/disconnect
 */
export function PolymarketConnect() {
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useAccount()
  const { isTradingInitialized, isTradingInitializing, initializeTrading } = usePolymarket()

  if (isConnected) {
    return (
      <div className="flex flex-col gap-3 p-4 bg-[#1A1A1F] border border-[#2D2D35] rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-mono text-[#4A4A55]">Connected</p>
            <p className="text-[#F5EDE0] font-medium">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </p>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-4 py-2 rounded-lg bg-[#2D2D35] hover:bg-[#FF3B3B]/20 text-[#F5EDE0] transition-all duration-200"
          >
            Disconnect
          </button>
        </div>

        {!isTradingInitialized && !isTradingInitializing && (
          <button
            onClick={initializeTrading}
            className="w-full px-4 py-2 rounded-lg bg-[#C45D3E] hover:bg-[#D4714A] text-[#F5EDE0] font-semibold transition-all duration-200"
          >
            Initialize Trading
          </button>
        )}

        {isTradingInitializing && (
          <div className="flex items-center justify-center gap-2 py-2">
            <div className="w-4 h-4 border-2 border-[#C45D3E]/30 border-t-[#C45D3E] rounded-full animate-spin" />
            <span className="text-sm text-[#4A4A55]">Initializing...</span>
          </div>
        )}

        {isTradingInitialized && (
          <div className="flex items-center gap-2 py-2">
            <div className="w-2 h-2 rounded-full bg-[#3BFF8A] animate-pulse" />
            <span className="text-sm text-[#3BFF8A]">Trading Ready</span>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#1A1A1F] border border-[#2D2D35] rounded-xl">
      <p className="text-sm text-[#4A4A55] mb-2">Connect your wallet to start trading</p>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="px-4 py-2 rounded-lg bg-[#C45D3E] hover:bg-[#D4714A] text-[#F5EDE0] font-semibold transition-all duration-200"
        >
          Connect with {connector.name}
        </button>
      ))}
    </div>
  )
}
