"use client"

import { http, createConfig } from 'wagmi'
import { mainnet, arbitrum, optimism, polygon, base, avalanche } from 'wagmi/chains'
import { injected, walletConnect, coinbaseWallet } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo'

export const config = createConfig({
  chains: [mainnet, arbitrum, optimism, polygon, base, avalanche],
  connectors: [
    injected(),
    walletConnect({ projectId }),
    coinbaseWallet({ appName: 'Intento Market' }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [base.id]: http(),
    [avalanche.id]: http(),
  },
})

export const CHAIN_CONFIG = {
  [mainnet.id]: { name: 'Ethereum', color: '#627EEA', icon: 'ETH' },
  [arbitrum.id]: { name: 'Arbitrum', color: '#28A0F0', icon: 'ARB' },
  [optimism.id]: { name: 'Optimism', color: '#FF0420', icon: 'OP' },
  [polygon.id]: { name: 'Polygon', color: '#8247E5', icon: 'MATIC' },
  [base.id]: { name: 'Base', color: '#0052FF', icon: 'BASE' },
  [avalanche.id]: { name: 'Avalanche', color: '#E84142', icon: 'AVAX' },
}
