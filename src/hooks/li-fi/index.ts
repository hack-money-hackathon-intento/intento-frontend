import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { useActiveWallet } from 'thirdweb/react'
import { getAddress } from 'viem'

import { Balances } from '@/models/balances'
import { liFiService } from '@/services/rest/li-fi'

const QUERY_KEY_PREFIX = 'combinator-intento'
const QUERY_KEY_BALANCES = `${QUERY_KEY_PREFIX}-balances`

interface LiFiReturn {
	useBalances: () => UseQueryResult<Balances[], Error>
}

export function useLiFi(): LiFiReturn {
	// li.fi service
	const { getBalances } = liFiService()

	// thirdweb
	const wallet = useActiveWallet()
	const _chainId = useMemo(() => wallet?.getChain()?.id ?? 0, [wallet])
	const account = useMemo(() => wallet?.getAccount(), [wallet])
	const accountAddress = useMemo(() => {
		try {
			return getAddress(account?.address as Address)
		} catch (_error) {
			return ZERO_ADDRESS
		}
	}, [account])

	return {
		useBalances: (): UseQueryResult<Balances[], Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_BALANCES, accountAddress],
				enabled: accountAddress && accountAddress !== ZERO_ADDRESS,
				queryFn: async (): Promise<Balances[]> => {
					const results = await getBalances(accountAddress)
					if (!results.success) throw results.error
					return results.data!
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: Balances[] | undefined) => previous
			})
		}
	}
}
