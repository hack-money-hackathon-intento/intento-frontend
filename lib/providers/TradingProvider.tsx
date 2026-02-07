'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ClobClient } from '@polymarket/clob-client'
import { RelayClient } from '@polymarket/builder-relayer-client'
import { BuilderConfig } from '@polymarket/builder-signing-sdk'
import { ethers } from 'ethers'
import { useWallet } from './WalletProvider'
import { useSafeDeployment } from '../hooks/polymarket/useSafeDeployment'
import { useUserApiCredentials } from '../hooks/polymarket/useUserApiCredentials'

interface BackendCredentials {
  safeAddress: string
  userApiCredentials: {
    key: string
    secret: string
    passphrase: string
  }
  eoaAddress: string
  chainId: number
}

interface TradingContextType {
  clobClient: ClobClient | null
  isInitialized: boolean
  isInitializing: boolean
  positions: any[]
  initializeTrading: () => Promise<void>
  initializeForBackend: () => Promise<BackendCredentials>
  refreshPositions: () => Promise<void>
  createOrder: (params: CreateOrderParams) => Promise<string>
  cancelOrder: (orderId: string) => Promise<void>
}

interface CreateOrderParams {
  tokenId: string
  price: number
  size: number
  side: 'BUY' | 'SELL'
}

const TradingContext = createContext<TradingContextType>({
  clobClient: null,
  isInitialized: false,
  isInitializing: false,
  positions: [],
  initializeTrading: async () => {},
  initializeForBackend: async () => ({ safeAddress: '', userApiCredentials: { key: '', secret: '', passphrase: '' }, eoaAddress: '', chainId: 137 }),
  refreshPositions: async () => {},
  createOrder: async () => '',
  cancelOrder: async () => {},
})

// Polymarket configuration
const POLYMARKET_CONFIG = {
  clobUrl: 'https://clob.polymarket.com',
  chainId: 137, // Polygon
  builderApiKey: process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_API_KEY || '',
  builderSecret: process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_SECRET || '',
  builderAddress: process.env.NEXT_PUBLIC_POLYMARKET_BUILDER_ADDRESS || '',
}

export function TradingProvider({ children }: { children: React.ReactNode }) {
  const { ethersSigner, isConnected, address, chainId, walletClient } = useWallet()
  const [clobClient, setClobClient] = useState<ClobClient | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [positions, setPositions] = useState<any[]>([])
  const [relayClient, setRelayClient] = useState<RelayClient | null>(null)

  // Hooks para Safe y Credentials
  const { setupSafe, safeAddress } = useSafeDeployment(relayClient)
  const { getCredentials } = useUserApiCredentials()

  // Initialize RelayClient when wallet connects
  useEffect(() => {
    if (ethersSigner && chainId === 137 && !relayClient) {
      const builderConfig = new BuilderConfig({
        remoteBuilderConfig: {
          url: '/api/polymarket/sign', // Remote signing endpoint (opcional)
        },
      })

      const relay = new RelayClient(
        'https://relayer.polymarket.com',
        137,
        ethersSigner as any,
        builderConfig
      )

      setRelayClient(relay)
    }
  }, [ethersSigner, chainId, relayClient])

  // Initialize CLOB client when wallet is connected
  const initializeTrading = useCallback(async () => {
    if (!ethersSigner || !address) {
      console.error('Wallet not connected')
      return
    }

    if (chainId !== 137) {
      console.error('Please switch to Polygon network')
      return
    }

    if (isInitializing || isInitialized) {
      return
    }

    setIsInitializing(true)

    try {
      console.log('🔧 Initializing Polymarket CLOB client...')

      // Builder config for attribution (if available)
      const builderConfig = POLYMARKET_CONFIG.builderApiKey
        ? {
            apiKey: POLYMARKET_CONFIG.builderApiKey,
            secret: POLYMARKET_CONFIG.builderSecret,
            address: POLYMARKET_CONFIG.builderAddress,
          }
        : undefined

      // Create CLOB client
      const client = new ClobClient(
        POLYMARKET_CONFIG.clobUrl,
        POLYMARKET_CONFIG.chainId,
        ethersSigner as any, // Type assertion for ethers v5
        undefined, // userApiCreds
        undefined, // signatureType
        undefined, // funderAddress
        undefined, // l2HeaderProvider
        false, // seedEOASignature
        builderConfig // Builder credentials
      )

      setClobClient(client)
      setIsInitialized(true)
      console.log('✅ Polymarket CLOB client initialized')
    } catch (error) {
      console.error('❌ Failed to initialize CLOB client:', error)
      setIsInitialized(false)
    } finally {
      setIsInitializing(false)
    }
  }, [ethersSigner, address, chainId, isInitializing, isInitialized])

  // Auto-initialize when wallet connects
  useEffect(() => {
    if (isConnected && ethersSigner && chainId === 137 && !isInitialized && !isInitializing) {
      initializeTrading()
    }
  }, [isConnected, ethersSigner, chainId, isInitialized, isInitializing, initializeTrading])

  // Create order on Polymarket
  const createOrder = useCallback(
    async (params: CreateOrderParams): Promise<string> => {
      if (!clobClient) {
        throw new Error('Trading not initialized. Call initializeTrading() first.')
      }

      try {
        console.log('📊 Creating order on Polymarket:', params)

        // Get market info for tick size and negRisk
        const marketInfo = await fetchMarketInfo(params.tokenId)

        const orderArgs = {
          tokenID: params.tokenId,
          price: params.price,
          size: params.size,
          side: params.side === 'BUY' ? 0 : 1, // 0 = BUY, 1 = SELL
        }

        const orderOptions = {
          tickSize: marketInfo?.tickSize || '0.01',
          negRisk: marketInfo?.negRisk || false,
        }

        const response = await clobClient.createAndPostOrder(
          orderArgs as any,
          orderOptions,
          0 // OrderType.GTC (Good-til-cancelled)
        )

        console.log('✅ Order created:', response)
        return response.orderID
      } catch (error) {
        console.error('❌ Failed to create order:', error)
        throw error
      }
    },
    [clobClient]
  )

  // Cancel order on Polymarket
  const cancelOrder = useCallback(
    async (orderId: string): Promise<void> => {
      if (!clobClient) {
        throw new Error('Trading not initialized')
      }

      try {
        console.log('🚫 Cancelling order:', orderId)
        await clobClient.cancelOrder({ orderID: orderId } as any)
        console.log('✅ Order cancelled')
      } catch (error) {
        console.error('❌ Failed to cancel order:', error)
        throw error
      }
    },
    [clobClient]
  )

  /**
   * NUEVA FUNCIÓN: Prepara todo para el backend
   * El frontend recolecta las firmas del usuario, el backend ejecuta
   */
  const initializeForBackend = useCallback(async (): Promise<BackendCredentials> => {
    if (!ethersSigner || !address) {
      throw new Error('Wallet not connected')
    }

    if (chainId !== 137) {
      throw new Error('Please switch to Polygon network')
    }

    console.log('🔧 Initializing for backend consumption...')

    // 1. Deploy/get Safe (requiere firma del usuario)
    const safeAddr = await setupSafe()

    // 2. Get User API Credentials (requiere firma del usuario)
    const creds = await getCredentials(ethersSigner)

    // 3. Retornar todo lo que el backend necesita
    const backendData: BackendCredentials = {
      safeAddress: safeAddr,
      userApiCredentials: creds,
      eoaAddress: address,
      chainId: 137,
    }

    console.log('✅ Ready for backend:', {
      safeAddress: safeAddr,
      eoaAddress: address,
      hasCredentials: !!creds,
    })

    return backendData
  }, [ethersSigner, address, chainId, setupSafe, getCredentials])

  /**
   * NUEVA FUNCIÓN: Listar posiciones del usuario
   * Requiere que el CLOB client esté inicializado
   */
  const refreshPositions = useCallback(async () => {
    if (!clobClient || !safeAddress) {
      console.warn('⚠️ Cannot refresh positions: client or safeAddress not ready')
      return
    }

    try {
      console.log('🔄 Fetching user positions...')
      // Nota: Este método puede requerir credentials autenticadas
      const userPositions = await clobClient.getPositions(safeAddress)
      setPositions(userPositions || [])
      console.log('✅ Positions loaded:', userPositions?.length || 0)
    } catch (error) {
      console.error('❌ Failed to fetch positions:', error)
      setPositions([])
    }
  }, [clobClient, safeAddress])

  const value: TradingContextType = {
    clobClient,
    isInitialized,
    isInitializing,
    positions,
    initializeTrading,
    initializeForBackend, // ✅ Para el backend del colega
    refreshPositions,     // ✅ Para listar posiciones
    createOrder,
    cancelOrder,
  }

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>
}

export function useTrading() {
  const context = useContext(TradingContext)
  if (context === undefined) {
    throw new Error('useTrading must be used within a TradingProvider')
  }
  return context
}

// Helper: Fetch market info from Polymarket API
async function fetchMarketInfo(tokenId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?clob_token_ids=${tokenId}`
    )

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    if (!data || data.length === 0) {
      return null
    }

    const market = data[0]
    return {
      tickSize: market.minimum_tick_size || '0.01',
      negRisk: market.neg_risk || false,
      marketSlug: market.market_slug,
      question: market.question,
    }
  } catch (error) {
    console.error('Error fetching market info:', error)
    return null
  }
}
