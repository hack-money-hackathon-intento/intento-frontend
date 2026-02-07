'use client'

import { useState } from 'react'
import { usePolymarket } from '@/lib/hooks/usePolymarket'

interface OrderFormProps {
  tokenId: string
  marketName: string
}

/**
 * Order Form Component
 * Allows users to create BUY/SELL orders on Polymarket
 */
export function OrderForm({ tokenId, marketName }: OrderFormProps) {
  const { createOrder, isReady } = usePolymarket()
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [price, setPrice] = useState('0.50')
  const [size, setSize] = useState('10')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!isReady) {
      setError('Trading not initialized. Please connect wallet and initialize trading.')
      return
    }

    const priceNum = parseFloat(price)
    const sizeNum = parseFloat(size)

    if (isNaN(priceNum) || priceNum <= 0 || priceNum > 1) {
      setError('Price must be between 0 and 1')
      return
    }

    if (isNaN(sizeNum) || sizeNum <= 0) {
      setError('Size must be greater than 0')
      return
    }

    setIsSubmitting(true)

    try {
      const orderId = await createOrder({
        tokenId,
        price: priceNum,
        size: sizeNum,
        side,
      })

      setSuccess(`Order created successfully! Order ID: ${orderId}`)
      setPrice('0.50')
      setSize('10')
    } catch (err: any) {
      console.error('Order creation failed:', err)
      setError(err.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-[#1A1A1F] border border-[#2D2D35] rounded-xl">
      <div>
        <h3 className="text-lg font-bold text-[#F5EDE0] mb-2">{marketName}</h3>
        <p className="text-xs font-mono text-[#4A4A55]">Token ID: {tokenId}</p>
      </div>

      <div>
        <label className="block text-sm text-[#4A4A55] mb-2">Side</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide('BUY')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              side === 'BUY'
                ? 'bg-[#3BFF8A]/20 text-[#3BFF8A] border-2 border-[#3BFF8A]'
                : 'bg-[#2D2D35] text-[#4A4A55] border-2 border-transparent'
            }`}
          >
            YES (BUY)
          </button>
          <button
            type="button"
            onClick={() => setSide('SELL')}
            className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
              side === 'SELL'
                ? 'bg-[#FF3B3B]/20 text-[#FF3B3B] border-2 border-[#FF3B3B]'
                : 'bg-[#2D2D35] text-[#4A4A55] border-2 border-transparent'
            }`}
          >
            NO (SELL)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-[#4A4A55] mb-2">Price (0-1)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full px-4 py-2 bg-[#0A0A0C] border border-[#2D2D35] rounded-lg text-[#F5EDE0] focus:border-[#C45D3E] focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm text-[#4A4A55] mb-2">Size (shares)</label>
        <input
          type="number"
          step="1"
          min="1"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full px-4 py-2 bg-[#0A0A0C] border border-[#2D2D35] rounded-lg text-[#F5EDE0] focus:border-[#C45D3E] focus:outline-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded-lg">
          <p className="text-sm text-[#FF3B3B]">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-[#3BFF8A]/10 border border-[#3BFF8A]/30 rounded-lg">
          <p className="text-sm text-[#3BFF8A]">{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={!isReady || isSubmitting}
        className="w-full px-6 py-3 rounded-lg bg-[#C45D3E] hover:bg-[#D4714A] text-[#F5EDE0] font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Creating Order...' : `Create ${side} Order`}
      </button>

      {!isReady && (
        <p className="text-xs text-center text-[#4A4A55]">
          Connect wallet and initialize trading to create orders
        </p>
      )}
    </form>
  )
}
