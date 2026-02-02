import { Address } from 'viem'

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
	enabled?: boolean
}

export interface Balances {
	chainId: number
	tokens: Token[]
}
