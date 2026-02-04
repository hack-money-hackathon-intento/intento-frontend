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
		contractAddress: '0xe893488d65D52130d7Fa3D57B9AA520a327ee04c'
	},
	{
		chainId: 10,
		chain: optimism,
		contractAddress: '0xe893488d65D52130d7Fa3D57B9AA520a327ee04c'
	},
	{
		chainId: 137,
		chain: polygon,
		contractAddress: '0x793d42beEBF15d58576c61062C494D61375e12C8'
	}
] as IntentoContract[]

export { verifyEnvVars } from './register'