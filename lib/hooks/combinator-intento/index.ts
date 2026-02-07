import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { useActiveWallet } from 'thirdweb/react'
import { getAddress } from 'viem'

import { INTENTO_CONTRACTS } from '@/lib/config/constants'
import { Balances } from '@/lib/models/balances'
import { IntentoContract } from '@/lib/services/blockchain/contracts/intento'

const QUERY_KEY_PREFIX = 'combinator-intento'
const QUERY_KEY_ARE_TOKENS_ENABLED = `${QUERY_KEY_PREFIX}-are-tokens-enabled`
const QUERY_KEY_IS_REGISTERED = `${QUERY_KEY_PREFIX}-is-registered`
const QUERY_KEY_IS_REGISTERED_BY_CHAIN = `${QUERY_KEY_PREFIX}-is-registered-by-chain`
const QUERY_KEY_GET_INTENTO_ADDRESS = `${QUERY_KEY_PREFIX}-get-intento-address`

interface CombinatorIntentoReturn {
	useBalancesWithEnabled: (
		balances: Balances[]
	) => UseQueryResult<Balances[], Error>
	useIsRegistered: () => UseQueryResult<boolean, Error>
	useIsRegisteredByChain: () => UseQueryResult<Record<number, boolean>, Error>
	useGetIntentoAddress: (chainId: number) => UseQueryResult<Address, Error>
}

export function useCombinatorIntento(): CombinatorIntentoReturn {
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
		// =========================
		//        READ METHODS
		// =========================
		useBalancesWithEnabled: (
			balances: Balances[]
		): UseQueryResult<Balances[], Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_ARE_TOKENS_ENABLED, accountAddress, balances],
				enabled:
					accountAddress &&
					accountAddress !== ZERO_ADDRESS &&
					balances.length > 0,
				queryFn: async (): Promise<Balances[]> => {
					const results = await Promise.all(
						intento.map(contract => {
							const chainId = contract.getChain().id

							const chainBalances = balances.find(
								balance => balance.chainId === chainId
							)

							const tokenAddresses =
								chainBalances?.tokens.map(token => token.address) ?? []

							return contract.areTokensEnabled(accountAddress, tokenAddresses)
						})
					)

					const enabledMap = new Map<string, boolean>()

					intento.forEach((contract, i) => {
						const chainId = contract.getChain().id
						const chainBalances = balances.find(
							balance => balance.chainId === chainId
						)

						if (chainBalances) {
							chainBalances.tokens.forEach((token, j) => {
								const isEnabled = results[i]?.[j] ?? false
								enabledMap.set(
									`${chainId}-${token.address.toLowerCase()}`,
									isEnabled
								)
							})
						}
					})

					return balances.map(chain => ({
						...chain,
						tokens: chain.tokens.map(token => ({
							...token,
							enabled:
								enabledMap.get(
									`${chain.chainId}-${token.address.toLowerCase()}`
								) ?? false
						}))
					}))
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: Balances[] | undefined) => previous
			})
		},
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
		},
		useIsRegisteredByChain: (): UseQueryResult<
			Record<number, boolean>,
			Error
		> => {
			return useQuery({
				queryKey: [QUERY_KEY_IS_REGISTERED_BY_CHAIN, accountAddress],
				enabled: accountAddress && accountAddress !== ZERO_ADDRESS,
				queryFn: async (): Promise<Record<number, boolean>> => {
					const results = await Promise.all(
						intento.map(contract => contract.isRegistered(accountAddress))
					)

					const registeredByChain: Record<number, boolean> = {}
					intento.forEach((contract, i) => {
						const chainId = contract.getChain().id
						registeredByChain[chainId] = results[i] ?? false
					})

					return registeredByChain
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: Record<number, boolean> | undefined) =>
					previous
			})
		},
		useGetIntentoAddress: (chainId: number): UseQueryResult<Address, Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_GET_INTENTO_ADDRESS, chainId],
				enabled: chainId !== 0,
				queryFn: async (): Promise<Address> => {
					return (
						INTENTO_CONTRACTS.find(contract => contract.chainId === chainId)
							?.contractAddress ?? ZERO_ADDRESS
					)
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: Address | undefined) => previous
			})
		}
		// =========================
		//        WRITE METHODS
		// =========================
	}
}
