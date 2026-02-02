'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { ConnectButton, useActiveWallet } from 'thirdweb/react'
import { useEnsName } from 'thirdweb/react'
import { getAddress } from 'viem'

import { chains, client } from '@/config/thirdweb.config'
import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { useLiFi } from '@/hooks/li-fi'

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
						<div key={index} className='bg-zinc-900 rounded-xl overflow-hidden'>
							{/* Header de la chain - Clickable */}
							<div
								className='flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800 transition-colors'
								onClick={() => toggleChain(balance.chainId)}
							>
								<div className='flex items-center gap-3'>
									<Image
										src={`/blockchains/${balance.chainId.toString()}.svg`}
										alt={getChainName(balance.chainId)}
										width={24}
										height={24}
										className='w-6 h-6'
									/>
									<span className='text-white font-medium text-base'>
										{getChainName(balance.chainId)}
									</span>
									<span className='text-zinc-500 text-sm'>
										({balance.tokens.length})
									</span>
								</div>
								<div className='flex items-center gap-3'>
									<span className='text-white font-medium'>
										${totalValue.toFixed(2)}
									</span>
									{/* Chevron animado */}
									<svg
										className={`w-5 h-5 text-zinc-400 transition-transform duration-300 ${
											isExpanded ? 'rotate-180' : 'rotate-0'
										}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</div>
							</div>

							{/* Lista de tokens - Desplegable */}
							{isExpanded && (
								<div className='border-t border-zinc-800'>
									{/* Tokens */}
									<div className='flex flex-col'>
										{balance.tokens.map((token, tokenIndex) => {
											const tokenKey = `${balance.chainId}-${token.address.toLowerCase()}`
											const isSelected = selectedTokens.has(tokenKey)

											return (
												<div
													key={tokenIndex}
													className='flex justify-between items-center p-4 hover:bg-zinc-800/50 transition-colors'
												>
													<div className='flex items-center gap-3'>
														<Image
															src={token.logoURI ?? '/placeholder.svg'}
															alt={token.symbol}
															width={40}
															height={40}
															className='w-10 h-10 rounded-full'
															unoptimized
														/>
														<div className='flex flex-col'>
															<span className='text-white font-medium'>
																{token.name}
															</span>
															<span className='text-zinc-400 text-sm'>
																{(
																	Number(token.amount) /
																	10 ** token.decimals
																).toFixed(6)}{' '}
																{token.symbol}
															</span>
														</div>
													</div>
													<div className='flex items-center gap-3'>
														<div className='flex flex-col items-end'>
															<span className='text-white font-medium'>
																$
																{(
																	(Number(token.amount) *
																		Number(token.priceUSD || 0)) /
																	10 ** token.decimals
																).toFixed(2)}
															</span>
															<span
																className={`text-xs ${token.enabled ? 'text-green-400' : 'text-red-400'}`}
															>
																{token.enabled ? 'Enabled' : 'Disabled'}
															</span>
														</div>
														{/* Checkbox del token */}
														<div className='relative'>
															<input
																type='checkbox'
																checked={isSelected}
																onChange={() =>
																	toggleToken(balance.chainId, token.address)
																}
																className='w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 appearance-none cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-zinc-500 transition-all'
															/>
															{isSelected && (
																<svg
																	className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none'
																	fill='none'
																	stroke='currentColor'
																	viewBox='0 0 24 24'
																>
																	<path
																		strokeLinecap='round'
																		strokeLinejoin='round'
																		strokeWidth={3}
																		d='M5 13l4 4L19 7'
																	/>
																</svg>
															)}
														</div>
													</div>
												</div>
											)
										})}
									</div>

									{/* Total al final */}
									<div className='border-t border-zinc-800 bg-zinc-950 p-4'>
										<div className='flex justify-between items-center'>
											<span className='text-white font-semibold text-base'>
												Total Value
											</span>
											<div className='flex items-center gap-3'>
												<span className='text-white font-bold text-lg'>
													${totalValue.toFixed(2)}
												</span>
												{/* Checkbox maestro - selecciona/deselecciona todos */}
												<div className='relative'>
													<input
														type='checkbox'
														checked={areAllTokensSelected(balance.chainId)}
														onChange={() => toggleAllTokens(balance.chainId)}
														className='w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 appearance-none cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-zinc-500 transition-all'
													/>
													{areAllTokensSelected(balance.chainId) && (
														<svg
															className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white pointer-events-none'
															fill='none'
															stroke='currentColor'
															viewBox='0 0 24 24'
														>
															<path
																strokeLinecap='round'
																strokeLinejoin='round'
																strokeWidth={3}
																d='M5 13l4 4L19 7'
															/>
														</svg>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</div>
	)
}
