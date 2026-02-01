import { useQuery, UseQueryResult } from '@tanstack/react-query'
import axios from 'axios'
import { useMemo } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { useActiveWallet } from 'thirdweb/react'
import { getAddress } from 'viem'

import { INTENTO_CONTRACTS } from '@/config/constants'
import { ServiceResult } from '@/models/api.model'
import { Balances } from '@/models/balances'
import { Tokens, TokensByChain } from '@/models/tokens.model'
import { IntentoContract } from '@/services/blockchain/contracts/intento'

const QUERY_KEY_PREFIX = 'combinator-intento'
const QUERY_KEY_ARE_TOKENS_ENABLED = `${QUERY_KEY_PREFIX}-are-tokens-enabled`
const QUERY_KEY_IS_REGISTERED = `${QUERY_KEY_PREFIX}-is-registered`
const QUERY_KEY_BALANCES = `${QUERY_KEY_PREFIX}-balances`
const QUERY_KEY_TOKENS = `${QUERY_KEY_PREFIX}-tokens`

interface CombinatorIntentoReturn {
	useAreTokensEnabled: (tokens: Tokens[]) => UseQueryResult<Tokens[], Error> // ← Cambiar aquí
	useIsRegistered: () => UseQueryResult<boolean, Error>
	useBalances: () => UseQueryResult<Balances[], Error>
	useTokens: () => UseQueryResult<TokensByChain, Error>
}

export function useCombinatorIntento(): CombinatorIntentoReturn {
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
		useAreTokensEnabled: (
			tokens: Tokens[]
		): UseQueryResult<Tokens[], Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_ARE_TOKENS_ENABLED, accountAddress],
				enabled:
					accountAddress &&
					accountAddress !== ZERO_ADDRESS &&
					tokens.length > 0,
				queryFn: async (): Promise<Tokens[]> => {
					// Obtener todos los tokens habilitados por contrato
					const results = await Promise.all(
						intento.map(contract =>
							contract.areTokensEnabled(
								accountAddress,
								tokens.flatMap(token => token.tokens.map(t => t.address))
							)
						)
					)

					const enabledMap = new Map<string, boolean>()
					const allAddresses = tokens.flatMap(t =>
						t.tokens.map(tok => tok.address.toLowerCase())
					)

					allAddresses.forEach((addr, index) => {
						const isEnabled = results.some(
							contractResult => contractResult[index]
						)
						enabledMap.set(addr, isEnabled)
					})

					return tokens.map(chain => ({
						...chain,
						tokens: chain.tokens.map(token => ({
							...token,
							enabled: enabledMap.get(token.address.toLowerCase()) ?? false
						}))
					}))
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: Tokens[] | undefined) => previous
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
		useBalances: (): UseQueryResult<Balances[], Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_BALANCES, accountAddress],
				enabled: accountAddress && accountAddress !== ZERO_ADDRESS,
				queryFn: async (): Promise<Balances[]> => {
					const results = await Promise.all(
						INTENTO_CONTRACTS.map(contract => {
							const searchParams = new URLSearchParams()
							searchParams.set('chainId', String(contract.chainId))
							searchParams.set('address', accountAddress)
							return axios.get<ServiceResult<Balances>>(
								`/api/balances?${searchParams.toString()}`
							)
						})
					)

					return results.flatMap(result =>
						result.data.success && result.data.data ? [result.data.data] : []
					)
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: Balances[] | undefined) => previous
			})
		},
		useTokens: (): UseQueryResult<TokensByChain, Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_TOKENS, accountAddress],
				enabled: accountAddress && accountAddress !== ZERO_ADDRESS,
				queryFn: async (): Promise<TokensByChain> => {
					const results =
						await axios.get<ServiceResult<TokensByChain>>(`/api/tokens`)

					if (!results.data.success) throw results.data.error
					return results.data.data!
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: TokensByChain | undefined) => previous
			})
		}
	}
}
