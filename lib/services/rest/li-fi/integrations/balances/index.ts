import axios from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/lib/models/api.model'
import { APIError } from '@/lib/models/api.model'
import { Balances } from '@/lib/models/balances'

import { BalancesResponse } from '../../utils/dtos/balances.dto'
import { mapBalancesResponseToBalances } from '../../utils/mappings/balances-dto-to-balances'

type WalletsIntegrations = {
	getBalances: (address: Address) => Promise<ServiceResult<Balances[]>>
}

export function walletsIntegrations(
	host: string,
	endpoint: string
): WalletsIntegrations {
	return {
		getBalances: async (
			address: Address
		): Promise<ServiceResult<Balances[]>> => {
			try {
				const response = await axios.get<BalancesResponse>(
					`${host}/${endpoint}/${address}/balances`,
					{
						params: {
							extended: 'true'
						}
					}
				)

				return {
					success: true,
					data: mapBalancesResponseToBalances(response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
