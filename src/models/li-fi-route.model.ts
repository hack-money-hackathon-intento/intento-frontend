import { Address, Hex } from 'viem'

export interface LiFiRoute {
	fromAmountUSD: string
	route: {
		to: Address
		approval: Address
		value: bigint
		data: Hex
	}
}
