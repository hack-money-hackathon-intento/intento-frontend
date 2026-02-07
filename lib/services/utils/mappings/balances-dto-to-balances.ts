import { Address, getAddress } from 'viem'

import { Balances, Token } from '@/lib/models/balances'
import { BalancesDto } from '@/lib/services/utils/dtos/balances.dto'

export function mapBalancesDtoToBalances(
	chainId: number,
	response: BalancesDto
): Balances {
	const tokens: Token[] = Object.entries(response)
		.filter(([, balance]) => BigInt(balance.balance) > BigInt(0))
		.map(([address, balance]) => ({
			address: getAddress(address as Address),
			amount: balance.balance as string,
			chainId,
			symbol: '', // Missing in DTO
			decimals: 18, // Default
			name: '',
			priceUSD: '0',
			logoURI: ''
		}))

	return {
		chainId,
		tokens
	}
}
