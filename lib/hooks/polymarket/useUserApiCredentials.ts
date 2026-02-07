import { ClobClient } from '@polymarket/clob-client'

interface UserApiCredentials {
  key: string
  secret: string
  passphrase: string
}

export const useUserApiCredentials = () => {
  /**
   * Genera las "llaves de trading" (User API Credentials)
   * El backend las necesitará para operar en nombre del usuario
   *
   * @param signer - ethers.Signer del usuario (desde wagmi)
   * @returns Credentials para pasar al backend
   */
  const getCredentials = async (signer: any): Promise<UserApiCredentials> => {
    // Cliente temporal solo para la firma EIP-712
    const tempClient = new ClobClient('https://clob.polymarket.com', 137, signer)

    try {
      // Intenta recuperar existentes (usuarios recurrentes)
      console.log('🔑 Deriving existing API credentials (requires signature)...')
      const creds = await tempClient.deriveApiKey()
      console.log('✅ API credentials derived')
      return creds
    } catch (e) {
      // Crea nuevas (usuarios nuevos) - pide firma en el front
      console.log('🔑 Creating new API credentials (requires signature)...')
      const creds = await tempClient.createApiKey()
      console.log('✅ API credentials created')
      return creds
    }
  }

  return { getCredentials }
}
