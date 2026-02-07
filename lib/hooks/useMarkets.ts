import { useQuery } from '@tanstack/react-query'
import { polymarketService, PolymarketMarket } from '@/lib/services/polymarket'
import { useEffect, useState } from 'react'

interface UseMarketsOptions {
  limit?: number
  category?: string
  active?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseMarketsReturn {
  markets: PolymarketMarket[]
  loading: boolean
  error: string | null
  refetch: () => void
}

/**
 * Hook to fetch Polymarket markets with auto-refresh
 */
export function useMarkets(options: UseMarketsOptions = {}): UseMarketsReturn {
  const {
    limit = 20,
    category = 'all',
    active = true,
    autoRefresh = false,
    refreshInterval = 30000,
  } = options

  const [shouldRefetch, setShouldRefetch] = useState(0)

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['polymarket-markets', limit, category, active],
    queryFn: async () => {
      return polymarketService.getMarkets({
        limit,
        category: category !== 'all' ? category : undefined,
        active,
        order: 'volume24hr',
      })
    },
    refetchInterval: autoRefresh ? refreshInterval : false,
    retry: 2,
    staleTime: 15000, // Consider data fresh for 15 seconds
  })

  const handleRefetch = () => {
    setShouldRefetch((prev) => prev + 1)
    refetch()
  }

  return {
    markets: data || [],
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch: handleRefetch,
  }
}
