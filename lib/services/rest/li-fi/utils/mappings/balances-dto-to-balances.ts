import { getAddress } from 'viem'

import { Balances } from '@/lib/models/balances'

import { BalancesResponse } from '../dtos/balances.dto'

export function mapBalancesResponseToBalances(
	balancesResponse: BalancesResponse
): Balances[] {
	return Object.entries(balancesResponse.balances).map(
		([chainId, tokensDto]) => ({
			chainId: Number(chainId),
			tokens: tokensDto.map(tokenDto => ({
				address: getAddress(tokenDto.address),
				symbol: tokenDto.symbol,
				decimals: tokenDto.decimals,
				amount: tokenDto.amount,
				name: tokenDto.name,
				chainId: tokenDto.chainId,
				priceUSD: tokenDto.priceUSD || '0',
				logoURI: tokenDto.logoURI || ''
			}))
		})
	)
}
