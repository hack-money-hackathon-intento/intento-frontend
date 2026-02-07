'use client';

import { useState, useEffect, useCallback } from 'react';
import { polymarketService, PolymarketMarket } from '@/lib/services/polymarket';

/**
 * Hook para lista de mercados con auto-refresh opcional
 */
export function useMarkets(options?: {
  limit?: number;
  category?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}) {
  const [markets, setMarkets] = useState<PolymarketMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarkets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await polymarketService.getMarkets({
        limit: options?.limit || 20,
        active: true,
        category: options?.category && options.category !== 'all'
          ? options.category
          : undefined,
        order: 'volume24hr', // Ordenar por volumen 24h (más populares primero)
      });

      setMarkets(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch markets';
      setError(errorMessage);
      console.error('Markets fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.limit, options?.category]);

  useEffect(() => {
    fetchMarkets();

    // Auto-refresh si está habilitado
    if (options?.autoRefresh) {
      const interval = setInterval(
        fetchMarkets,
        options.refreshInterval || 30000 // Default 30 segundos
      );
      return () => clearInterval(interval);
    }
  }, [fetchMarkets, options?.autoRefresh, options?.refreshInterval]);

  return {
    markets,
    loading,
    error,
    refetch: fetchMarkets,
  };
}

/**
 * Hook para un mercado individual (página de trading)
 */
export function useMarket(marketId: string | null) {
  const [market, setMarket] = useState<PolymarketMarket | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) {
      setMarket(null);
      return;
    }

    async function fetchMarket() {
      try {
        setLoading(true);
        setError(null);
        const data = await polymarketService.getMarket(marketId!);
        setMarket(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Market not found';
        setError(errorMessage);
        console.error('Market fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchMarket();
  }, [marketId]);

  return { market, loading, error };
}

/**
 * Hook para price history (charts)
 */
export function useMarketChart(marketId: string | null) {
  const [chartData, setChartData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!marketId) {
      setChartData(null);
      return;
    }

    async function fetchChart() {
      try {
        setLoading(true);
        setError(null);
        const data = await polymarketService.getPriceHistory(marketId!);
        setChartData(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Chart data unavailable';
        setError(errorMessage);
        console.error('Chart fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChart();
  }, [marketId]);

  return { chartData, loading, error };
}

/**
 * Hook para categorías disponibles
 */
export function useCategories() {
  const categories = [
    { id: 'all', label: 'All', icon: '🔥' },
    { id: 'politics', label: 'Politics', icon: '🏛️' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'science', label: 'Science', icon: '🔬' },
    { id: 'tech', label: 'Tech', icon: '💻' },
    { id: 'economics', label: 'Economics', icon: '📈' },
  ];

  return { categories };
}

/**
 * Hook para health check de la API
 */
export function useAPIHealth() {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkHealth() {
      try {
        const healthy = await polymarketService.healthCheck();
        setIsHealthy(healthy);
      } catch {
        setIsHealthy(false);
      } finally {
        setChecking(false);
      }
    }

    checkHealth();

    // Re-check every 60 seconds
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  return { isHealthy, checking };
}
