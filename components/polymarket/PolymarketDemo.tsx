'use client'

import { PolymarketConnect } from './PolymarketConnect'
import { OrderForm } from './OrderForm'
import { usePolymarket } from '@/lib/hooks/usePolymarket'

/**
 * Complete Polymarket Demo Component
 * Shows connection status and order form
 */
export function PolymarketDemo() {
  const { isConnected, isTradingInitialized, chainId } = usePolymarket()

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#F5EDE0] mb-2">Polymarket Trading</h1>
        <p className="text-[#4A4A55]">
          Connect your wallet and create orders on prediction markets
        </p>
      </div>

      {/* Connection Section */}
      <PolymarketConnect />

      {/* Network Warning */}
      {isConnected && chainId !== 137 && (
        <div className="p-4 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-xl">
          <p className="text-[#FF3B3B] font-semibold">⚠️ Wrong Network</p>
          <p className="text-sm text-[#4A4A55] mt-1">
            Please switch to Polygon network to use Polymarket
          </p>
        </div>
      )}

      {/* Order Form (only show when trading is initialized) */}
      {isTradingInitialized && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#F5EDE0]">Create Order</h2>
          <OrderForm
            tokenId="21742633143463906290569050155826241533067272736897614950488156847949938836455"
            marketName="Will Donald Trump win the 2024 US Presidential Election?"
          />
          
          <div className="p-4 bg-[#2D2D35]/30 border border-[#2D2D35] rounded-xl">
            <p className="text-xs text-[#4A4A55] leading-relaxed">
              <strong className="text-[#F5EDE0]">Note:</strong> This is a demo. Replace the tokenId with a real market token ID from Polymarket.
              You can find token IDs using the Polymarket API or by inspecting market URLs.
            </p>
          </div>
        </div>
      )}

      {/* Status Indicators */}
      {isConnected && (
        <div className="grid grid-cols-3 gap-3">
          <StatusCard
            label="Wallet"
            value="Connected"
            status="success"
          />
          <StatusCard
            label="Network"
            value={chainId === 137 ? 'Polygon' : 'Wrong'}
            status={chainId === 137 ? 'success' : 'error'}
          />
          <StatusCard
            label="Trading"
            value={isTradingInitialized ? 'Ready' : 'Not Ready'}
            status={isTradingInitialized ? 'success' : 'warning'}
          />
        </div>
      )}
    </div>
  )
}

function StatusCard({
  label,
  value,
  status,
}: {
  label: string
  value: string
  status: 'success' | 'error' | 'warning'
}) {
  const colors = {
    success: 'bg-[#3BFF8A]/10 border-[#3BFF8A]/30 text-[#3BFF8A]',
    error: 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B]',
    warning: 'bg-[#C45D3E]/10 border-[#C45D3E]/30 text-[#C45D3E]',
  }

  return (
    <div className={`p-3 border rounded-lg ${colors[status]}`}>
      <p className="text-xs text-[#4A4A55]">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  )
}
