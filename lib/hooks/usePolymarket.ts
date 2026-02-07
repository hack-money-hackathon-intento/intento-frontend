import { useWallet } from '../providers/WalletProvider'
import { useTrading } from '../providers/TradingProvider'

/**
 * Unified hook for Polymarket integration
 * Combines wallet and trading functionality
 */
export function usePolymarket() {
  const wallet = useWallet()
  const trading = useTrading()

  return {
    // Wallet state
    address: wallet.address,
    isConnected: wallet.isConnected,
    chainId: wallet.chainId,
    walletClient: wallet.walletClient,
    ethersSigner: wallet.ethersSigner,
    isWalletLoading: wallet.isLoading,

    // Trading state
    clobClient: trading.clobClient,
    isTradingInitialized: trading.isInitialized,
    isTradingInitializing: trading.isInitializing,

    // Trading actions
    initializeTrading: trading.initializeTrading,
    createOrder: trading.createOrder,
    cancelOrder: trading.cancelOrder,

    // Helper computed values
    isReady: wallet.isConnected && wallet.chainId === 137 && trading.isInitialized,
    canTrade: wallet.isConnected && wallet.chainId === 137 && !wallet.isLoading,
  }
}

// Re-export individual hooks for granular access
export { useWallet } from '../providers/WalletProvider'
export { useTrading } from '../providers/TradingProvider'
