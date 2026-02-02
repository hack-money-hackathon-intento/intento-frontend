import {
	useMutation,
	UseMutationResult,
	useQuery,
	UseQueryResult
} from '@tanstack/react-query'
import { useMemo } from 'react'
import { ZERO_ADDRESS } from 'thirdweb'
import { ChainOptions } from 'thirdweb/chains'
import { useActiveWallet } from 'thirdweb/react'
import { Address, getAddress, Hex, zeroAddress } from 'viem'

import { INTENTO_CONTRACTS } from '@/config/constants'
import { ContractError, ServiceResult } from '@/models/api.model'
import { ERC20Contract } from '@/services/blockchain/contracts/erc20'

interface approveParams {
	spender: Address
	amount: bigint
}

interface UseErc20Return {
	useAllowance: (spender: Address) => UseQueryResult<bigint, Error>
	useBalanceOf: () => UseQueryResult<
		{ balance: number; rawBalance: bigint },
		Error
	>
	useApprove: () => UseMutationResult<Hex, ContractError, approveParams>
}

export function useErc20(
	chainId: number,
	contractAddress: Address
): UseErc20Return {
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

	// chain
	const chain = useMemo(
		() =>
			INTENTO_CONTRACTS.find(contract => contract.chainId === chainId)?.chain ??
			({} as Readonly<ChainOptions & { rpc: string }>),
		[chainId]
	)

	// erc20 instance
	const erc20 = useMemo(
		() => new ERC20Contract(contractAddress, chain, account),
		[contractAddress, chain, account]
	)

	const QUERY_KEY = `${chainId}-${contractAddress}`
	const QUERY_KEY_ALLOWANCE = `${QUERY_KEY}-allowance`
	const QUERY_KEY_BALANCE_OF = `${QUERY_KEY}-balance-of`

	return {
		// =========================
		//        READ METHODS
		// =========================
		useAllowance: (spender: Address): UseQueryResult<bigint, Error> => {
			return useQuery({
				queryKey: [QUERY_KEY_ALLOWANCE, accountAddress] as const,
				enabled: !!accountAddress && accountAddress !== zeroAddress,
				queryFn: async (): Promise<bigint> => {
					return await erc20.allowance(accountAddress, spender)
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (previous: bigint | undefined) => previous
			})
		},

		useBalanceOf: (): UseQueryResult<
			{ balance: number; rawBalance: bigint },
			Error
		> => {
			return useQuery({
				queryKey: [QUERY_KEY_BALANCE_OF, accountAddress] as const,
				enabled: !!accountAddress && accountAddress !== zeroAddress,
				queryFn: async (): Promise<{ balance: number; rawBalance: bigint }> => {
					const { balance, rawBalance } = await erc20.balanceOf(accountAddress)
					return { balance, rawBalance }
				},
				staleTime: 30000,
				refetchOnWindowFocus: false,
				placeholderData: (
					previous: { balance: number; rawBalance: bigint } | undefined
				) => previous
			})
		},
		// =========================
		//        WRITE METHODS
		// =========================

		useApprove: (): UseMutationResult<
			Hex,
			ContractError,
			{ spender: Address; amount: bigint }
		> => {
			return useMutation<Hex, ContractError, approveParams>({
				mutationFn: async ({
					spender,
					amount
				}: approveParams): Promise<Hex> => {
					const result: ServiceResult<Hex> = await erc20.approve(
						spender,
						amount
					)

					if (!result.success) throw result.error
					return result.data as Hex // Hex string of the transaction hash
				}
			})
		}
	}
}
