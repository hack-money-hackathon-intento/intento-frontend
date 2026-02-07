'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { WalletClient } from 'viem'
import { ethers } from 'ethers'

interface WalletContextType {
  address: string | undefined
  isConnected: boolean
  chainId: number | undefined
  walletClient: WalletClient | undefined
  ethersSigner: ethers.Signer | undefined
  isLoading: boolean
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  chainId: undefined,
  walletClient: undefined,
  ethersSigner: undefined,
  isLoading: true,
})

// Convert viem WalletClient to ethers Signer
function walletClientToSigner(walletClient: WalletClient): ethers.Signer {
  const { account, chain, transport } = walletClient
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  }

  const provider = new ethers.providers.Web3Provider(transport, network)
  const signer = provider.getSigner(account.address)
  return signer
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected, chainId } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [ethersSigner, setEthersSigner] = useState<ethers.Signer | undefined>()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (walletClient) {
      try {
        const signer = walletClientToSigner(walletClient)
        setEthersSigner(signer)
      } catch (error) {
        console.error('Error converting wallet client to signer:', error)
      }
    } else {
      setEthersSigner(undefined)
    }
    setIsLoading(false)
  }, [walletClient])

  const value: WalletContextType = {
    address,
    isConnected,
    chainId,
    walletClient,
    ethersSigner,
    isLoading,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
