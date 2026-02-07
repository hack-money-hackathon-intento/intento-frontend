import { RawAxiosRequestHeaders } from 'axios'

import { register } from '@/lib/config/constants/register'

import { walletsIntegrations } from './integrations/balances'

function getApiKey(): string {
	const {
		octav: { apiKey }
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
	return 'https://api.octav.fi/v1'
}

export function octavService() {
	const host = getHost()
	const headers = getHeaders()

	const { getBalances } = walletsIntegrations(host, headers, 'wallet')

	return {
		getBalances
	}
}
