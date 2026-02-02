import Image from 'next/image'
import { useMemo } from 'react'
import { ZERO_ADDRESS } from 'thirdweb'

import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { useErc20 } from '@/hooks/erc-20'
import { Balances } from '@/models/balances'

type Props = {
	index: number
	balance: Balances
	isExpanded: boolean
	selectedTokens: Set<string>
	totalValue: number
	getChainName: (chainId: number) => string
	toggleChain: (chainId: number) => void
	toggleToken: (chainId: number, tokenAddress: string) => void
	toggleAllTokens: (chainId: number) => void
}

export function Blockchain(props: Props) {
	const {
		index,
		balance,
		isExpanded,
		selectedTokens,
		totalValue,
		getChainName,
		toggleChain,
		toggleToken,
		toggleAllTokens,
	} = props

	// combinator intento hook
	const { useGetIntentoAddress } = useCombinatorIntento()
	const { data: dataIntentoAddress, isLoading: _isLoadingIntentoAddress } =
		useGetIntentoAddress(balance.chainId)

	const intentoAddress = useMemo(() => {
		return dataIntentoAddress ?? ZERO_ADDRESS
	}, [dataIntentoAddress])

	/// erc20 hook
	const { useAllowance, useBalanceOf } = useErc20(
		balance.chainId,
		balance.tokens[0].address
	)

	/// allowance
	const { data: dataAllowance, isLoading: _isLoadingAllowance } =
		useAllowance(intentoAddress)

	const _allowance = useMemo(() => {
		return dataAllowance ?? 0
	}, [dataAllowance])

	/// balance of
	const { data: dataBalanceOf, isLoading: _isLoadingBalanceOf } = useBalanceOf()
	const _balanceOf = useMemo(() => {
		return dataBalanceOf ?? 0
	}, [dataBalanceOf])

	const areAllSelected = useMemo(() => {
		if (balance.tokens.length === 0) return false
		return balance.tokens.every(token =>
			selectedTokens.has(`${balance.chainId}-${token.address.toLowerCase()}`)
		)
	}, [balance.chainId, balance.tokens, selectedTokens])

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
					<div className='relative' onClick={event => event.stopPropagation()}>
						<input
							type='checkbox'
							checked={areAllSelected}
							onChange={() => toggleAllTokens(balance.chainId)}
							className='w-5 h-5 rounded border-2 border-zinc-600 bg-zinc-800 appearance-none cursor-pointer checked:bg-blue-500 checked:border-blue-500 hover:border-zinc-500 transition-all'
						/>
						{areAllSelected && (
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
										<span className='text-white font-medium'>{token.name}</span>
										<span className='text-zinc-400 text-sm'>
											{(Number(token.amount) / 10 ** token.decimals).toFixed(6)}{' '}
											{token.symbol}
										</span>
									</div>
								</div>
								<div className='flex items-center gap-3'>
									<div className='flex flex-col items-end'>
										<span className='text-white font-medium'>
											$
											{(
												(Number(token.amount) * Number(token.priceUSD || 0)) /
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
			</div>
		</div>
	)
}
