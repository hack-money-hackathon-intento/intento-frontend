'use client'

import { useEffect, useMemo, useState } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { ConnectButton, useActiveWallet } from 'thirdweb/react'
import { useEnsName } from 'thirdweb/react'
import { getAddress } from 'viem'

import { chains, client } from '@/config/thirdweb.config'
import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { useLiFi } from '@/hooks/li-fi'

import { Blockchain } from './componets/Blockchain'

export default function Home() {
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

	const { data: _ensName } = useEnsName({
		client,
		address: accountAddress
	})

	// li.fi
	// balances
	const { useBalances } = useLiFi()
	const { data: dataBalances, isLoading: _isLoadingBalances } = useBalances()

	const balances = useMemo(() => {
		return dataBalances ?? []
	}, [dataBalances])

	// intento
	const { useBalancesWithEnabled, useIsRegistered } = useCombinatorIntento()

	/// is registered
	const { data: dataIsRegistered, isLoading: isLoadingIsRegistered } =
		useIsRegistered()

	const isRegistered = useMemo(() => {
		return dataIsRegistered ?? false
	}, [dataIsRegistered])

	// balances with enabled
	const {
		data: dataBalancesWithEnabled,
		isLoading: _isLoadingBalancesWithEnabled
	} = useBalancesWithEnabled(balances)

	const balancesWithEnabled = useMemo(() => {
		const balances = dataBalancesWithEnabled ?? []

		// Ordenar chains por valor total (de mayor a menor)
		return balances
			.map(balance => ({
				...balance,
				// Ordenar tokens dentro de cada chain por valor en USD (de mayor a menor)
				tokens: [...balance.tokens]
					.filter(token => token.address !== ZERO_ADDRESS)
					.sort((a, b) => {
						const valueA =
							(Number(a.amount) * Number(a.priceUSD || 0)) / 10 ** a.decimals
						const valueB =
							(Number(b.amount) * Number(b.priceUSD || 0)) / 10 ** b.decimals
						return valueB - valueA // De mayor a menor
					})
			}))
			.sort((a, b) => {
				// Calcular valor total de cada chain
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
				return totalB - totalA // De mayor a menor
			})
	}, [dataBalancesWithEnabled])

	// Estado para manejar qué chains están expandidas
	const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set())

	// Estado para manejar tokens seleccionados: "chainId-tokenAddress"
	const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())

	// Sincronizar checkboxes con el estado "enabled" de los tokens
	useEffect(() => {
		if (balancesWithEnabled.length > 0) {
			const enabledTokens = new Set<string>()

			balancesWithEnabled.forEach(balance => {
				balance.tokens.forEach(token => {
					if (token.enabled) {
						enabledTokens.add(
							`${balance.chainId}-${token.address.toLowerCase()}`
						)
					}
				})
			})

			setSelectedTokens(enabledTokens)
		}
	}, [balancesWithEnabled])

	// Toggle chain expansion
	const toggleChain = (chainId: number) => {
		setExpandedChains(prev => {
			const newSet = new Set(prev)
			if (newSet.has(chainId)) {
				newSet.delete(chainId)
			} else {
				newSet.add(chainId)
			}
			return newSet
		})
	}

	// Verificar si todos los tokens de una chain están seleccionados
	const areAllTokensSelected = (chainId: number) => {
		const chain = balancesWithEnabled.find(b => b.chainId === chainId)
		if (!chain || chain.tokens.length === 0) return false

		return chain.tokens.every(token =>
			selectedTokens.has(`${chainId}-${token.address.toLowerCase()}`)
		)
	}

	// Toggle todos los tokens de una chain
	const toggleAllTokens = (chainId: number) => {
		const chain = balancesWithEnabled.find(b => b.chainId === chainId)
		if (!chain) return

		setSelectedTokens(prev => {
			const newSet = new Set(prev)
			const allSelected = areAllTokensSelected(chainId)

			if (allSelected) {
				// Deseleccionar todos
				chain.tokens.forEach(token => {
					newSet.delete(`${chainId}-${token.address.toLowerCase()}`)
				})
			} else {
				// Seleccionar todos
				chain.tokens.forEach(token => {
					newSet.add(`${chainId}-${token.address.toLowerCase()}`)
				})
			}
			return newSet
		})
	}

	// Toggle un token individual
	const toggleToken = (chainId: number, tokenAddress: string) => {
		setSelectedTokens(prev => {
			const newSet = new Set(prev)
			const key = `${chainId}-${tokenAddress.toLowerCase()}`

			if (newSet.has(key)) {
				newSet.delete(key)
			} else {
				newSet.add(key)
			}
			return newSet
		})
	}

	// Función para calcular el valor total de una chain (ya no necesita filtrar, se hace en useMemo)
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

	// Función para obtener el nombre de la chain
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
				<div className='w-full flex flex-row justify-center items-center'>
					<p>You are not registered</p>
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
