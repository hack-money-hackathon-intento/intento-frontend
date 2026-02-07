/**
 * Polymarket Service
 * Connects to Python FastAPI backend for Polymarket data
 */

const PYTHON_API = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

export interface PolymarketMarket {
  id: string;
  question: string;
  description: string;
  outcomePrices: string;      // "[\"0.68\", \"0.32\"]"
  outcomes: string;            // "[\"Yes\", \"No\"]"
  volume: number;
  volume24hr: number;
  liquidity: number;
  liquidityClob: number;
  endDate: string;
  category: string;
  image?: string;
  active: boolean;
  closed: boolean;
  // Campos adicionales para trading
  clobTokenIds?: string;       // IDs de tokens en el CLOB
  conditionId?: string;
  marketMakerAddress?: string;
}

export interface MarketStats {
  totalVolume: string;
  volume24h: string;
  liquidity: string;
  participants: number;
  priceHistory: { timestamp: number; yesPrice: number; noPrice: number }[];
}

export const polymarketService = {
  /**
   * Obtener mercados con filtros
   */
  async getMarkets(params?: {
    limit?: number;
    offset?: number;
    active?: boolean;
    category?: string;
    order?: 'volume24hr' | 'liquidity' | 'endDate';
  }): Promise<PolymarketMarket[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.offset) searchParams.set('offset', params.offset.toString());
      if (params?.active !== undefined) searchParams.set('active', params.active.toString());
      if (params?.category) searchParams.set('category', params.category);
      if (params?.order) searchParams.set('order', params.order);

      const res = await fetch(`${PYTHON_API}/polymarket/markets?${searchParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add cache for performance
        next: { revalidate: 30 }, // Revalidate every 30 seconds
      });

      if (!res.ok) {
        throw new Error(`Polymarket API error: ${res.status}`);
      }

      return res.json();
    } catch (error) {
      console.error('Failed to fetch markets:', error);
      throw error;
    }
  },

  /**
   * Obtener detalle de un mercado específico
   */
  async getMarket(marketId: string): Promise<PolymarketMarket> {
    try {
      const res = await fetch(`${PYTHON_API}/polymarket/markets/${marketId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Market not found: ${marketId}`);
      }

      return res.json();
    } catch (error) {
      console.error(`Failed to fetch market ${marketId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener historial de precios para charts
   */
  async getPriceHistory(marketId: string): Promise<MarketStats> {
    try {
      const res = await fetch(`${PYTHON_API}/polymarket/markets/${marketId}/chart`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error('Chart data not available');
      }

      return res.json();
    } catch (error) {
      console.error(`Failed to fetch chart for ${marketId}:`, error);
      throw error;
    }
  },

  /**
   * Parsear precios YES/NO desde el formato de Polymarket
   */
  parsePrices(outcomePrices: string): { yes: number; no: number } {
    try {
      const prices = JSON.parse(outcomePrices);
      const yes = Number(prices[0]) || 0.5;
      const no = Number(prices[1]) || 0.5;
      return { yes, no };
    } catch (error) {
      console.error('Failed to parse prices:', error);
      return { yes: 0.5, no: 0.5 };
    }
  },

  /**
   * Formatear volumen para UI ($2.4M, $820K, etc.)
   */
  formatVolume(volume: number): string {
    if (volume >= 1_000_000) {
      return `$${(volume / 1_000_000).toFixed(1)}M`;
    }
    if (volume >= 1_000) {
      return `$${(volume / 1_000).toFixed(0)}K`;
    }
    return `$${volume.toFixed(0)}`;
  },

  /**
   * Formatear fecha ISO a "Jan 31, 2025"
   */
  formatDate(isoDate: string): string {
    try {
      return new Date(isoDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  },

  /**
   * Mapear categoría de Polymarket a nuestras categorías UI
   */
  mapCategory(polymarketCategory: string): string {
    const categoryMap: Record<string, string> = {
      'politics': 'Politics',
      'crypto': 'Crypto',
      'sports': 'Sports',
      'pop-culture': 'Entertainment',
      'science-tech': 'Tech',
      'economics': 'Economics',
      'business': 'Economics',
    };

    return categoryMap[polymarketCategory.toLowerCase()] || 'Other';
  },

  /**
   * Health check de la API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch(`${PYTHON_API}/health`, {
        method: 'GET',
      });
      return res.ok;
    } catch {
      return false;
    }
  },
};
