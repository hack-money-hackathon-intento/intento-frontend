import { Address } from 'viem'

export interface BalancesDto {
	[key: Address]: {
		allowance: string
		balance: string
	}
}
