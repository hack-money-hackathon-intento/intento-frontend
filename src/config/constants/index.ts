import { Address } from 'thirdweb'
import { base, Chain, optimism, polygon } from 'thirdweb/chains'

type IntentoContract = {
	chainId: number
	chain: Chain
	contractAddress: Address
}

export const INTENTO_CONTRACTS = [
	{
		chainId: 8453,
		chain: base,
		contractAddress: '0xD2Ed7b56fF997DA6f5b7b72Cc7676Bc9BA9B9240'
	},
	{
		chainId: 10,
		chain: optimism,
		contractAddress: '0xD2Ed7b56fF997DA6f5b7b72Cc7676Bc9BA9B9240'
	},
	{
		chainId: 137,
		chain: polygon,
		contractAddress: '0xD2Ed7b56fF997DA6f5b7b72Cc7676Bc9BA9B9240'
	}
] as IntentoContract[]

export { verifyEnvVars } from './register'
