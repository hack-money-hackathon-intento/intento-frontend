import axios from 'axios'
import { RawAxiosRequestHeaders } from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/lib/models/api.model'
import { APIError } from '@/lib/models/api.model'
import { Balances } from '@/lib/models/balances'
import { BalancesDto } from '@/lib/services/utils/dtos/balances.dto'
import { mapBalancesDtoToBalances } from '@/lib/services/utils/mappings/balances-dto-to-balances'

type BalanceService = {
	getBalances: (
		chainId: number,
		address: Address
	) => Promise<ServiceResult<Balances>>
}

export function balanceService(
	host: string,
	headers: RawAxiosRequestHeaders,
	endpoint: string
): BalanceService {
	return {
		getBalances: async (
			chainId: number,
			address: Address
		): Promise<ServiceResult<Balances>> => {
			try {
				const response = await axios.get<BalancesDto>(
					`${host}/${endpoint}/${chainId}/allowancesAndBalances/${address}/${address}`,
					{ headers }
				)

				return {
					success: true,
					data: mapBalancesDtoToBalances(chainId, response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
