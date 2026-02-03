import Image from 'next/image'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'

import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { useErc20 } from '@/hooks/erc-20'
import { Balances } from '@/models/balances'

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

type Props = {
	index: number
	balance: Balances
	isExpanded: boolean
	selectedTokens: Set<string>
	totalValue: number
	getChainName: (chainId: number) => string
	toggleChain: (chainId: number) => void
	toggleToken: (
		chainId: number,
		tokenAddress: string,
		checked: boolean,
		spender: Address,
		rawBalance: bigint,
		rawAllowance: bigint
	) => void
	toggleAllTokens: (
		chainId: number,
		checked: boolean,
		spender: Address,
		balancesByToken: Record<string, bigint>,
		allowancesByToken: Record<string, bigint>
	) => void

	isLast: boolean
	stepStatus: StepStatus
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

		isLast: _isLast,
		stepStatus
	} = props

	const [balancesByToken, setBalancesByToken] = useState<
		Record<string, bigint>
	>({})
	const [allowancesByToken, setAllowancesByToken] = useState<
		Record<string, bigint>
	>({})

	const onMeta = useCallback(
		(addrLower: string, rawBalance: bigint, rawAllowance: bigint) => {
			setBalancesByToken(prev =>
				prev[addrLower] === rawBalance
					? prev
					: { ...prev, [addrLower]: rawBalance }
			)
			setAllowancesByToken(prev =>
				prev[addrLower] === rawAllowance
					? prev
					: { ...prev, [addrLower]: rawAllowance }
			)
		},
		[]
	)

	// intento
	/// address
	const { useGetIntentoAddress } = useCombinatorIntento()
	const { data: dataIntentoAddress } = useGetIntentoAddress(balance.chainId)

	const intentoAddress = useMemo(() => {
		return dataIntentoAddress ?? ZERO_ADDRESS
	}, [dataIntentoAddress])

	const areAllSelected = useMemo(() => {
		if (balance.tokens.length === 0) return false
		return balance.tokens.every(token => {
			const key = `${balance.chainId}-${token.address.toLowerCase()}`
			return selectedTokens.has(key)
		})
	}, [balance.chainId, balance.tokens, selectedTokens])

	// Note: ERC20 allowance checks are done per-token in TokenMetaRow, not here

	return (
		<div key={index} className='bg-zinc-900 rounded-xl overflow-hidden'>
			{/* Header */}
			<div
				className='flex justify-between items-center p-4 cursor-pointer hover:bg-zinc-800 transition-colors'
				onClick={() => toggleChain(balance.chainId)}
			>
				<div className='flex items-center gap-3'>
					{/* 👇 Step icon (logo) */}
					<ChainStepIcon
						chainId={balance.chainId}
						label={getChainName(balance.chainId)}
						status={stepStatus}
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
							onChange={event =>
								toggleAllTokens(
									balance.chainId,
									event.target.checked,
									intentoAddress,
									balancesByToken,
									allowancesByToken
								)
							}
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
						const addrLower = token.address.toLowerCase()

						return (
							<Fragment key={tokenIndex}>
								{/* Meta (on-chain) — siempre montado para llenar cache */}
								<TokenMetaRow
									chainId={balance.chainId}
									tokenAddress={token.address}
									intentoAddress={intentoAddress}
									onMeta={onMeta}
								/>

								{/* UI row */}
								{isExpanded && (
									<div className='flex justify-between items-center p-4 hover:bg-zinc-800/50 transition-colors'>
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
													className={`text-xs ${
														token.enabled ? 'text-green-400' : 'text-red-400'
													}`}
												>
													{token.enabled ? 'Enabled' : 'Disabled'}
												</span>
											</div>

											<div className='relative'>
												<input
													type='checkbox'
													checked={isSelected}
													onChange={event => {
														toggleToken(
															balance.chainId,
															token.address,
															event.target.checked,
															intentoAddress,
															balancesByToken[addrLower] ?? BigInt(0),
															allowancesByToken[addrLower] ?? BigInt(0)
														)
													}}
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
								)}
							</Fragment>
						)
					})}
				</div>
			</div>
		</div>
	)
}

type TokenMetaRowProps = {
	chainId: number
	tokenAddress: Address
	intentoAddress: Address
	onMeta: (addrLower: string, rawBalance: bigint, rawAllowance: bigint) => void
}

function TokenMetaRow(props: TokenMetaRowProps) {
	const { chainId, tokenAddress, intentoAddress, onMeta } = props

	const { useAllowance, useBalanceOf } = useErc20(chainId, tokenAddress)

	const { data: dataAllowance } = useAllowance(intentoAddress)
	const { data: dataBalanceOf } = useBalanceOf()

	const addrLower = useMemo(() => tokenAddress.toLowerCase(), [tokenAddress])

	const rawAllowance = useMemo(() => {
		// ajusta si tu hook retorna otro shape
		return dataAllowance ?? BigInt(0)
	}, [dataAllowance])

	const rawBalance = useMemo(() => {
		// tu hook ya trae rawBalance
		return dataBalanceOf?.rawBalance ?? BigInt(0)
	}, [dataBalanceOf])

	useEffect(() => {
		onMeta(addrLower, rawBalance, rawAllowance)
	}, [addrLower, rawBalance, rawAllowance, onMeta])

	return null
}

function ChainStepIcon({
	chainId,
	label,
	status
}: {
	chainId: number
	label: string
	status: 'idle' | 'loading' | 'done' | 'error'
}) {
	return (
		<div className='relative z-10'>
			{/* ring loading */}
			{status === 'loading' && (
				<div className='absolute -inset-1 rounded-full border-2 border-blue-500 border-t-transparent animate-spin' />
			)}

			{/* main circle */}
			<div
				className={[
					'h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border',
					status === 'done'
						? 'border-blue-500'
						: status === 'error'
							? 'border-red-500'
							: 'border-zinc-700'
				].join(' ')}
			>
				<Image
					src={`/blockchains/${chainId.toString()}.svg`}
					alt={label}
					width={18}
					height={18}
					className='h-[18px] w-[18px]'
				/>
			</div>

			{/* done badge */}
			{status === 'done' && (
				<div className='absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center border border-zinc-900'>
					<svg
						className='h-3 w-3 text-white'
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
				</div>
			)}

			{/* error badge (opcional) */}
			{status === 'error' && (
				<div className='absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center border border-zinc-900'>
					<span className='text-[10px] text-white leading-none'>!</span>
				</div>
			)}
		</div>
	)
}
