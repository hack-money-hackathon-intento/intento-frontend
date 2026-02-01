import { Address } from 'viem'

export type TokensByChain = Record<'8453' | '10' | '137', Token[]>

export interface Token {
	chainId: number
	address: Address
	symbol: string
	name: string
	decimals: number
	priceUSD: string
	coinKey?: string
	logoURI?: string
	balance?: string
}

export interface Tokens {
	chainId: number
	tokens: Token[]
}
