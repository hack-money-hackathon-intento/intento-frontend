'use client'

import Image from 'next/image'
import { useMemo } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { ConnectButton, useActiveWallet } from 'thirdweb/react'
import { useEnsName } from 'thirdweb/react'
import { getAddress } from 'viem'

import { chains, client } from '@/config/thirdweb.config'
import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { Token, Tokens } from '@/models/tokens.model'

const NATIVE_1INCH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
const NATIVE_LIFI = '0x0000000000000000000000000000000000000000'
const normalizeAddress = (address: string): string => {
	const addr = address.toLowerCase()
	// Si es el nativo de 1inch, convertir al formato de LiFi
	if (addr === NATIVE_1INCH) return NATIVE_LIFI
	return addr
}

export default function Home() {
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

	const { data: ensName } = useEnsName({
		client,
		address: accountAddress
	})

	// intento
	const { useAreTokensEnabled, useIsRegistered, useBalances, useTokens } =
		useCombinatorIntento()

	/// is registered
	const { data: dataIsRegistered, isLoading: isLoadingIsRegistered } =
		useIsRegistered()

	const isRegistered = useMemo(() => {
		return dataIsRegistered ?? false
	}, [dataIsRegistered])

	/// balances
	const { data: dataBalances, isLoading: isLoadingBalances } = useBalances()

	const balances = useMemo(() => {
		return dataBalances ?? []
	}, [dataBalances])

	/// tokens
	const { data: dataTokens, isLoading: isLoadingTokens } = useTokens()

	const tokensByChain = useMemo(() => {
		return dataTokens ?? {}
	}, [dataTokens])

	const tokensWithBalance = useMemo(() => {
		if (balances.length === 0 || Object.keys(tokensByChain).length === 0)
			return []

		return (Object.entries(tokensByChain) as [string, Token[]][])
			.map(([chainId, tokens]) => {
				const chainBalance = balances.find(b => b.chainId === Number(chainId))

				if (!chainBalance) return null

				const tokensFiltered = tokens
					.filter(token => {
						const normalizedTokenAddr = normalizeAddress(token.address)
						// Excluir token nativo
						if (normalizedTokenAddr === NATIVE_LIFI) return false

						const tokenBalance = chainBalance.balances.find(
							t => normalizeAddress(t.address) === normalizedTokenAddr
						)
						return tokenBalance && Number(tokenBalance.balance) > 0
					})
					.map(token => ({
						...token,
						balance:
							chainBalance.balances.find(
								t =>
									normalizeAddress(t.address) ===
									normalizeAddress(token.address)
							)?.balance ?? '0'
					}))

				return {
					chainId: Number(chainId),
					tokens: tokensFiltered
				}
			})
			.filter(item => item !== null && item.tokens.length > 0) as Tokens[]
	}, [balances, tokensByChain])

	/// are tokens enabled
	const { data: dataAreTokensEnabled, isLoading: isLoadingAreTokensEnabled } =
		useAreTokensEnabled(tokensWithBalance)

	const tokensWithBalanceAndEnabled = useMemo(() => {
		return dataAreTokensEnabled ?? []
	}, [dataAreTokensEnabled])

	const sortedTokensWithBalanceAndEnabled = useMemo(() => {
		return [...tokensWithBalanceAndEnabled]
			.map(chain => {
				// Encontrar el token con mayor balance en USD
				const topToken = chain.tokens.reduce((max, token) => {
					const tokenValueUSD =
						(Number(token.balance) * Number(token.priceUSD)) /
						10 ** token.decimals
					const maxValueUSD =
						(Number(max.balance) * Number(max.priceUSD)) / 10 ** max.decimals
					return tokenValueUSD > maxValueUSD ? token : max
				}, chain.tokens[0])

				const totalValueUSD = chain.tokens.reduce((sum, token) => {
					return (
						sum +
						(Number(token.balance) * Number(token.priceUSD)) /
							10 ** token.decimals
					)
				}, 0)

				return {
					...chain,
					topToken,
					totalValueUSD
				}
			})
			.sort((a, b) => b.totalValueUSD - a.totalValueUSD)
	}, [tokensWithBalanceAndEnabled])

	const areTokensEnabled = useMemo(() => {
		return dataAreTokensEnabled ?? []
	}, [dataAreTokensEnabled])

	console.log('areTokensEnabled:', areTokensEnabled)

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
				{sortedTokensWithBalanceAndEnabled.map(chain => (
					<div key={chain.chainId} className='bg-zinc-900 rounded-xl p-4'>
						{/* Header de la chain */}
						<div className='flex justify-between items-center mb-3'>
							<div className='flex items-center gap-2'>
								<Image
									src={`/blockchains/${chain.chainId.toString()}.svg`}
									alt=''
									width={20}
									height={20}
									className='w-5 h-5'
								/>
								<span className='text-white font-medium'>
									{chain.chainId === 10
										? 'Optimism'
										: chain.chainId === 137
											? 'Polygon'
											: chain.chainId === 8453
												? 'Base'
												: 'Unknown'}
								</span>
							</div>
							<span className='text-white font-medium'>
								${chain.totalValueUSD.toFixed(2)}
							</span>
						</div>

						{/* Token principal */}
						{chain.topToken && (
							<div className='flex justify-between items-center pl-2'>
								<div className='flex items-center gap-3'>
									<Image
										src={chain.topToken.logoURI ?? '/placeholder.svg'}
										alt={chain.topToken.symbol}
										width={40}
										height={40}
										className='w-10 h-10 rounded-full'
										unoptimized
									/>
									<div className='flex flex-col'>
										<span className='text-white font-medium'>
											{chain.topToken.name}
										</span>
										<span className='text-zinc-400 text-sm'>
											{(
												Number(chain.topToken.balance) /
												10 ** chain.topToken.decimals
											).toFixed(6)}{' '}
											{chain.topToken.symbol}
										</span>
									</div>
								</div>
								<div className='flex flex-col items-end'>
									<span className='text-white'>
										$
										{(
											(Number(chain.topToken.balance) *
												Number(chain.topToken.priceUSD)) /
											10 ** chain.topToken.decimals
										).toFixed(2)}
									</span>
								</div>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	)
}
