import { RawAxiosRequestHeaders } from 'axios'

import { verifyEnvVars } from '@/config/constants/env-var'

import { balanceService } from './balance'

function getApiKey(): string {
	const {
		register: { oneInch }
	} = verifyEnvVars()
	return oneInch.apiKey
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
