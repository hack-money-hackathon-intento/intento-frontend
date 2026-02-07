import { RawAxiosRequestHeaders } from 'axios'

import { register } from '@/lib/config/constants/register'

import { balanceService } from './balance'

function getApiKey(): string {
	const {
		oneInch: { apiKey }
	} = register
	return apiKey
}

function getHeaders(): RawAxiosRequestHeaders {
	const apiKey = getApiKey()

	return {
		authorization: `Bearer ${apiKey}`
	}
}

function getHost(): string {
	const host: string = 'https://api.1inch.com'

	return host
}

export function oneInchService() {
	const host = getHost()
	const headers = getHeaders()

	const { getBalances } = balanceService(host, headers, 'balance/v1.2')

	return { getBalances }
}
