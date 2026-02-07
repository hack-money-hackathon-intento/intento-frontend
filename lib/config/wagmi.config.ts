import { http, createConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

// WalletConnect project ID - Add yours from https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [polygon],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'Intento',
      preference: 'smartWalletOnly',
    }),
    walletConnect({
      projectId,
      showQrModal: true,
    }),
  ],
  transports: {
    [polygon.id]: http(),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof wagmiConfig
  }
}
