import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { useActiveWallet } from 'thirdweb/react'
import { getAddress } from 'viem'

import { INTENTO_CONTRACTS } from '@/config/constants'
import { IntentoContract } from '@/services/blockchain/contracts/intento'

const QUERY_KEY_PREFIX = 'combinator-intento'
const QUERY_KEY_IS_REGISTERED = `${QUERY_KEY_PREFIX}-is-registered`

export function useCombinatorIntento() {
	// thirdweb
	const wallet = useActiveWallet()
	const chainId = useMemo(() => wallet?.getChain()?.id ?? 0, [wallet])
	const account = useMemo(() => wallet?.getAccount(), [wallet])
	const accountAddress = useMemo(() => {
		try {
			return getAddress(account?.address as Address)
		} catch (_error) {
			return ZERO_ADDRESS
		}
	}, [account])

	// intento instances
	const intento = useMemo(() => {
		return INTENTO_CONTRACTS.map(contract => {
			return new IntentoContract(
				contract.contractAddress,
				contract.chain,
				account
			)
		})
	}, [account])

	return {
		useIsRegistered: (): UseQueryResult<boolean, Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_IS_REGISTERED, accountAddress],
				enabled: accountAddress && accountAddress !== ZERO_ADDRESS,
				queryFn: async (): Promise<boolean> => {
					const results = await Promise.all(
						intento.map(contract => contract.isRegistered(accountAddress))
					)

					return results.some(registered => registered)
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: boolean | undefined) => previous
			})
		}
	}
}
