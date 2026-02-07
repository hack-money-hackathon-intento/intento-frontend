import axios, { RawAxiosRequestHeaders } from 'axios'
import { Address } from 'viem'

import { ServiceResult } from '@/lib/models/api.model'
import { APIError } from '@/lib/models/api.model'
import { Balances } from '@/lib/models/balances'

import { WalletResponse } from '../../utils/dtos/wallet.dto'
import { mapWalletResponseToBalances } from '../../utils/mappings/balances-dto-to-balances'

type WalletIntegrations = {
	getBalances: (address: Address) => Promise<ServiceResult<Balances[]>>
}

export function walletsIntegrations(
	host: string,
	headers: RawAxiosRequestHeaders,
	endpoint: string
): WalletIntegrations {
	return {
		getBalances: async (
			address: Address
		): Promise<ServiceResult<Balances[]>> => {
			try {
				const response = await axios.get<WalletResponse>(
					`${host}/${endpoint}`,
					{
						headers,
						params: {
							addresses: address
						}
					}
				)

				return {
					success: true,
					data: mapWalletResponseToBalances(response.data)
				}
			} catch (error) {
				return { success: false, error: error as APIError }
			}
		}
	}
}
