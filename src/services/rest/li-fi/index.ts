import { walletsIntegrations } from './integrations/balances'

function getHost(): string {
	return 'https://li.quest/v1'
}

export function liFiService() {
	const host = getHost()

	const { getBalances } = walletsIntegrations(host, 'wallets')

	return {
		getBalances
	}
}
