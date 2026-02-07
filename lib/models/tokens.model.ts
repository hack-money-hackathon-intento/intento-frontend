import { Address } from 'viem'

export type TokensByChain = Record<string, Token[]>

export interface Token {
	address: Address
	symbol: string
	decimals: number
	amount: string
	name: string
	chainId: number
	priceUSD?: string
	marketCapUSD?: number
	volumeUSD24H?: number
	fdvUSD?: number
	logoURI?: string
}

export interface Tokens {
	chainId: number
	tokens: Token[]
}
