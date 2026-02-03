'use client'

import { useEffect, useMemo, useState } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { ConnectButton, useActiveWallet, useEnsName } from 'thirdweb/react'
import { encodeFunctionData, getAddress } from 'viem'

import { intentoAbi } from '@/assets/json/abis'
import { chains, client } from '@/config/thirdweb.config'
import { buildApproveCalls } from '@/helpers/build-approve-call.helper'
import { toBigIntSafe } from '@/helpers/to-bigint-safe.helper'
import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { useLiFi } from '@/hooks/li-fi'

import { Blockchain } from './componets/Blockchain'

export default function Home() {
	// thirdweb
	const wallet = useActiveWallet()
	const account = useMemo(() => wallet?.getAccount(), [wallet])
	const accountAddress = useMemo(() => {
		try {
			return getAddress(account?.address as Address)
		} catch {
			return ZERO_ADDRESS
		}
	}, [account])

	useEnsName({
		client,
		address: accountAddress
	})

	// states
	const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set())
	const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())
	// Objeto diff-only (vacío hasta click)
	const [selectionByChain, setSelectionByChain] = useState<
		Record<
			string,
			{
				spender: Address
				addresses: string[]
				enable: boolean[]
				balances: bigint[]
				allowances: bigint[]
			}
		>
	>({})

	// li.fi
	/// balances
	const { useBalances } = useLiFi()
	const { data: dataBalances } = useBalances()

	const balances = useMemo(() => dataBalances ?? [], [dataBalances])

	// combinator intento
	const { useBalancesWithEnabled, useIsRegistered } = useCombinatorIntento()

	/// balances with enabled
	const { data: dataIsRegistered, isLoading: isLoadingIsRegistered } =
		useIsRegistered()

	const isRegistered = useMemo(
		() => dataIsRegistered ?? false,
		[dataIsRegistered]
	)

	/// balances with enabled
	const { data: dataBalancesWithEnabled } = useBalancesWithEnabled(balances)

	const balancesWithEnabled = useMemo(() => {
		const list = dataBalancesWithEnabled ?? []

		return list
			.map(balance => ({
				...balance,
				tokens: [...balance.tokens]
					.filter(token => token.address !== ZERO_ADDRESS)
					.sort((a, b) => {
						const valueA =
							(Number(a.amount) * Number(a.priceUSD || 0)) / 10 ** a.decimals
						const valueB =
							(Number(b.amount) * Number(b.priceUSD || 0)) / 10 ** b.decimals
						return valueB - valueA
					})
			}))
			.sort((a, b) => {
				const totalA = a.tokens.reduce(
					(acc, token) =>
						acc +
						(Number(token.amount) * Number(token.priceUSD || 0)) /
							10 ** token.decimals,
					0
				)
				const totalB = b.tokens.reduce(
					(acc, token) =>
						acc +
						(Number(token.amount) * Number(token.priceUSD || 0)) /
							10 ** token.decimals,
					0
				)
				return totalB - totalA
			})
	}, [dataBalancesWithEnabled])

	// effects
	useEffect(() => {
		if (balancesWithEnabled.length === 0) return

		const enabledTokens = new Set<string>()
		balancesWithEnabled.forEach(balance => {
			balance.tokens.forEach(token => {
				if (token.enabled) {
					enabledTokens.add(`${balance.chainId}-${token.address.toLowerCase()}`)
				}
			})
		})

		setSelectedTokens(prev => (prev.size > 0 ? prev : enabledTokens))
	}, [balancesWithEnabled])

	// functions
	const toggleChain = (chainId: number) => {
		setExpandedChains(prev => {
			const next = new Set(prev)
			if (next.has(chainId)) {
				next.delete(chainId)
			} else {
				next.add(chainId)
			}
			return next
		})
	}

	const toggleAllTokens = (
		chainId: number,
		checked: boolean,
		spender: Address,
		balancesByToken: Record<string, bigint>,
		allowancesByToken: Record<string, bigint>
	) => {
		const chain = balancesWithEnabled.find(b => b.chainId === chainId)
		if (!chain) return

		// UI
		setSelectedTokens(prev => {
			const next = new Set(prev)
			chain.tokens.forEach(token => {
				const k = `${chainId}-${token.address.toLowerCase()}`
				if (checked) {
					next.add(k)
				} else {
					next.delete(k)
				}
			})
			return next
		})

		// Data diff-only
		setSelectionByChain(prev => {
			const next = { ...prev }
			const chainKey = String(chainId)

			const addresses: string[] = []
			const enable: boolean[] = []
			const balances: bigint[] = []
			const allowances: bigint[] = []

			chain.tokens.forEach(token => {
				if (checked === token.enabled) return // no diff

				const addr = token.address.toLowerCase()
				addresses.push(addr)
				enable.push(checked)

				if (checked) {
					balances.push(balancesByToken[addr] ?? BigInt(0))
					allowances.push(allowancesByToken[addr] ?? BigInt(0))
				} else {
					balances.push(BigInt(0))
					allowances.push(BigInt(0))
				}
			})

			if (addresses.length === 0) delete next[chainKey]
			else next[chainKey] = { spender, addresses, enable, balances, allowances }

			return next
		})
	}

	const toggleToken = (
		chainId: number,
		tokenAddress: string,
		checked: boolean,
		spender: Address,
		rawBalance: bigint,
		rawAllowance: bigint
	) => {
		const key = `${chainId}-${tokenAddress.toLowerCase()}`

		// UI
		setSelectedTokens(prev => {
			const next = new Set(prev)
			if (checked) {
				next.add(key)
			} else {
				next.delete(key)
			}
			return next
		})

		// Data diff-only
		setSelectionByChain(prev => {
			const chain = balancesWithEnabled.find(b => b.chainId === chainId)
			const token = chain?.tokens.find(
				t => t.address.toLowerCase() === tokenAddress.toLowerCase()
			)
			if (!token) return prev

			const shouldStore = checked !== token.enabled

			const next = { ...prev }
			const chainKey = String(chainId)
			const addressKey = tokenAddress.toLowerCase()
			const entry = next[chainKey]

			// volvió al original => borrar
			if (!shouldStore) {
				if (!entry) return prev
				const idx = entry.addresses.indexOf(addressKey)
				if (idx === -1) return prev

				const addresses = entry.addresses.filter((_, i) => i !== idx)
				const enable = entry.enable.filter((_, i) => i !== idx)
				const balances = entry.balances.filter((_, i) => i !== idx)
				const allowances = entry.allowances.filter((_, i) => i !== idx)

				if (addresses.length === 0) delete next[chainKey]
				else
					next[chainKey] = { spender, addresses, enable, balances, allowances }

				return next
			}

			// upsert delta
			const base = entry ?? {
				spender,
				addresses: [],
				enable: [],
				balances: [],
				allowances: []
			}

			const idx = base.addresses.indexOf(addressKey)

			const balanceValue = checked ? toBigIntSafe(rawBalance) : BigInt(0)
			const allowanceValue = checked ? toBigIntSafe(rawAllowance) : BigInt(0)

			if (idx === -1) {
				next[chainKey] = {
					spender,
					addresses: [...base.addresses, addressKey],
					enable: [...base.enable, checked],
					balances: [...base.balances, balanceValue],
					allowances: [...base.allowances, allowanceValue]
				}
			} else {
				next[chainKey] = {
					spender,
					addresses: base.addresses,
					enable: base.enable.map((v, i) => (i === idx ? checked : v)),
					balances: base.balances.map((v, i) => (i === idx ? balanceValue : v)),
					allowances: base.allowances.map((v, i) =>
						i === idx ? allowanceValue : v
					)
				}
			}

			return next
		})
	}

	const getChainTotalValue = (
		tokens: (typeof balancesWithEnabled)[0]['tokens']
	) => {
		return tokens.reduce(
			(acc, token) =>
				acc +
				(Number(token.amount) * Number(token.priceUSD || 0)) /
					10 ** token.decimals,
			0
		)
	}

	const getChainName = (chainId: number) => {
		switch (chainId) {
			case 10:
				return 'Optimism'
			case 137:
				return 'Polygon'
			case 8453:
				return 'Base'
			default:
				return 'Chain not supported'
		}
	}

	const onRegister = async () => {
		const selectedTokensWithApproveCallsByChain =
			buildApproveCalls(selectionByChain)

		Object.entries(selectedTokensWithApproveCallsByChain).forEach(
			([chainId, entry]) => {
				const approveCalls = entry.calls
				const registryCall = {
					to: entry.spender,
					data: encodeFunctionData({
						abi: intentoAbi,
						functionName: 'register',
						args: [entry.addresses, entry.enable]
					})
				}

				const calls = [...(approveCalls ?? []).filter(call => call !== null), registryCall]

				console.log(calls)
			}
		)
	}

	return (
		<div className='min-h-screen w-full flex flex-col justify-center items-center gap-6'>
			<div className='w-full flex flex-row justify-center items-center'>
				<ConnectButton
					client={client}
					chains={chains}
					connectButton={{ label: 'Connect Wallet' }}
				/>
			</div>

			{isLoadingIsRegistered ? (
				<div className='w-full flex flex-row justify-center items-center'>
					<p>Loading...</p>
				</div>
			) : isRegistered ? (
				<div className='w-full flex flex-row justify-center items-center'>
					<p>You are registered</p>
				</div>
			) : (
				<div className='w-full flex flex-col justify-center items-center gap-3'>
					<p>You are not registered</p>
					{Object.keys(selectionByChain).length > 0 && (
						<button
							onClick={onRegister}
							className='bg-blue-500 text-white px-4 py-2 rounded-md'
						>
							Register
						</button>
					)}
				</div>
			)}

			<div className='flex flex-col gap-2 w-full max-w-md'>
				{balancesWithEnabled.map((balance, index) => {
					if (
						balance.chainId !== 10 &&
						balance.chainId !== 137 &&
						balance.chainId !== 8453
					)
						return null

					const isExpanded = expandedChains.has(balance.chainId)
					const totalValue = getChainTotalValue(balance.tokens)

					return (
						<Blockchain
							key={index}
							index={index}
							balance={balance}
							isExpanded={isExpanded}
							selectedTokens={selectedTokens}
							totalValue={totalValue}
							getChainName={getChainName}
							toggleToken={toggleToken}
							toggleChain={toggleChain}
							toggleAllTokens={toggleAllTokens}
						/>
					)
				})}
			</div>
		</div>
	)
}
