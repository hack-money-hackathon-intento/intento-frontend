import { useState } from 'react'
import { useWalletClient } from 'wagmi'
import { RelayClient } from '@polymarket/builder-relayer-client'
import { deriveSafe } from '@polymarket/builder-relayer-client/dist/builder/derive'
import { getContractConfig } from '@polymarket/builder-relayer-client/dist/config'

export const useSafeDeployment = (relayClient: RelayClient | null) => {
  const { data: walletClient } = useWalletClient()
  const [safeAddress, setSafeAddress] = useState<string | null>(null)

  const setupSafe = async () => {
    if (!walletClient || !relayClient) {
      throw new Error('Wallet or RelayClient not available')
    }

    // 1. Derivar la dirección Safe (determinística desde EOA)
    const config = getContractConfig(137) // Polygon
    const derived = deriveSafe(walletClient.account.address, config.SafeContracts.SafeFactory)
    setSafeAddress(derived)

    // 2. Verificar si ya está desplegada
    const isDeployed = await relayClient.getDeployed(derived)

    // 3. Si no existe, desplegarla (requiere firma del usuario en el front)
    if (!isDeployed) {
      console.log('🔧 Deploying Safe wallet (requires user signature)...')
      const tx = await relayClient.deploy()
      await tx.wait()
      console.log('✅ Safe deployed at:', derived)
    } else {
      console.log('✅ Safe already deployed at:', derived)
    }

    return derived
  }

  return { setupSafe, safeAddress }
}
