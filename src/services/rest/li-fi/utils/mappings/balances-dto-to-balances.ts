import { getAddress } from 'viem'

import { Balances } from '@/models/balances'

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
				priceUSD: tokenDto.priceUSD,
				marketCapUSD: tokenDto.marketCapUSD,
				volumeUSD24H: tokenDto.volumeUSD24H,
				fdvUSD: tokenDto.fdvUSD,
				logoURI: tokenDto.logoURI
			}))
		})
	)
}
