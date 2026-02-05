'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRef } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { ConnectButton, useActiveWallet, useEnsName } from 'thirdweb/react'
import type { Hex } from 'viem'
import { encodeFunctionData, getAddress, zeroAddress } from 'viem'
import { numberToHex } from 'viem'

import { intentoAbi } from '@/assets/json/abis'
import { INTENTO_CONTRACTS } from '@/config/constants'
import { chains, client } from '@/config/thirdweb.config'
import { buildApproveCalls } from '@/helpers/build-approve-call.helper'
import { toBigIntSafe } from '@/helpers/to-bigint-safe.helper'
import { useCombinatorIntento } from '@/hooks/combinator-intento'
import { useLiFi } from '@/hooks/li-fi'

import { Blockchain } from './componets/Blockchain'
import { RegisterStep, RegisterStepper } from './componets/Stepper.tsx'

type Eip1193Provider = {
	request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

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
	const [registerStatusByChain, setRegisterStatusByChain] = useState<
		Record<number, StepStatus>
	>({})
	const [isRegistering, setIsRegistering] = useState(false)
	const timeoutsRef = useRef<number[]>([])
	const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set())
	const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())
	const [isSendingUsdBundle, setIsSendingUsdBundle] = useState(false)
	const [usdBundleError, setUsdBundleError] = useState<string | null>(null)
	const [usdBundleTxUrls, setUsdBundleTxUrls] = useState<string[] | null>(null)
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
	const { useBalancesWithEnabled, useIsRegistered, useIsRegisteredByChain } =
		useCombinatorIntento()

	/// is registered (any chain)
	const { data: dataIsRegistered, isLoading: isLoadingIsRegistered } =
		useIsRegistered()

	const isRegistered = useMemo(
		() => dataIsRegistered ?? false,
		[dataIsRegistered]
	)

	/// is registered by chain
	const { data: dataIsRegisteredByChain } = useIsRegisteredByChain()

	const isRegisteredByChain = useMemo(
		() => dataIsRegisteredByChain ?? {},
		[dataIsRegisteredByChain]
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

	// variables
	const chainOrder = useMemo(() => [10, 137, 8453], [])

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

	useEffect(() => {
		return () => {
			// cleanup timeouts
			timeoutsRef.current.forEach(t => clearTimeout(t))
			timeoutsRef.current = []
		}
	}, [])

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

	const registerSteps: RegisterStep[] = useMemo(() => {
		const selectedChainIds = Object.keys(selectionByChain)
			.map(Number)
			.sort((a, b) => chainOrder.indexOf(a) - chainOrder.indexOf(b))

		return selectedChainIds.map(chainId => ({
			id: chainId,
			label: getChainName(chainId),
			logoSrc: `/blockchains/${chainId}.svg`,
			status: registerStatusByChain[chainId] ?? 'idle'
		}))
	}, [selectionByChain, registerStatusByChain, chainOrder])

	const supportedBalances = useMemo(() => {
		return balancesWithEnabled.filter(
			b => b.chainId === 10 || b.chainId === 137 || b.chainId === 8453
		)
	}, [balancesWithEnabled])

	const getIntentoAddress = (chainId: number): Address => {
		return (
			INTENTO_CONTRACTS.find(contract => contract.chainId === chainId)
				?.contractAddress ?? ZERO_ADDRESS
		)
	}

	const computeFromAmountUsd = (priceUsd?: string, decimals?: number) => {
		const price = Number(priceUsd)
		if (!price || !decimals || price <= 0) return '0'
		const raw = Math.floor((1 / price) * 10 ** decimals)
		return raw > 0 ? raw.toString() : '0'
	}

	const createOrderId = () => {
		const bytes = new Uint8Array(32)
		crypto.getRandomValues(bytes)
		return `0x${Array.from(bytes)
			.map(b => b.toString(16).padStart(2, '0'))
			.join('')}`
	}

	const findTokenBySymbols = (
		tokens: (typeof balancesWithEnabled)[number]['tokens'],
		symbols: string[]
	) => {
		return tokens.find(token =>
			symbols.some(symbol => token.symbol.toLowerCase() === symbol.toLowerCase())
		)
	}

	const buildUsdBundleQuotes = () => {
		const baseSymbols = ['BIO', 'BRETT', 'REI']
		const optimismSymbols = ['OP', 'USDC']

		const quotesArgs: Record<string, QuoteArgs[]> = {}
		const missing: string[] = []

		const buildChainArgs = (chainId: number, symbols: string[]) => {
			const chain = balancesWithEnabled.find(b => b.chainId === chainId)
			if (!chain) {
				missing.push(`chain:${chainId}`)
				return
			}

			const intentoAddress = getIntentoAddress(chainId)
			const args: QuoteArgs[] = []

			symbols.forEach(symbol => {
				const token = findTokenBySymbols(chain.tokens, [symbol])
				if (!token) {
					missing.push(`${symbol}@${chainId}`)
					return
				}

				const fromAmount = computeFromAmountUsd(token.priceUSD, token.decimals)
				if (fromAmount === '0') {
					missing.push(`${symbol}@${chainId}:price`)
					return
				}

				args.push({
					fromToken: token.address,
					fromAmount,
					fromAddress: intentoAddress
				})
			})

			if (args.length > 0) {
				quotesArgs[String(chainId)] = args
			}
		}

		const buildOptimismArgs = (chainId: number) => {
			const chainIdNumber = Number(chainId)
			const chain = balancesWithEnabled.find(b => b.chainId === chainIdNumber)
			if (!chain) {
				missing.push(`chain:${chainId}`)
				return
			}

			const intentoAddress = getIntentoAddress(chainIdNumber)
			const args: QuoteArgs[] = []

			const token = findTokenBySymbols(chain.tokens, optimismSymbols)
			if (!token) {
				missing.push(`OP@${chainIdNumber}`)
				return
			}

			const fromAmount = computeFromAmountUsd(token.priceUSD, token.decimals)
			if (fromAmount === '0') {
				missing.push(`${token.symbol}@${chainIdNumber}:price`)
				return
			}

			args.push({
				fromToken: token.address,
				fromAmount,
				fromAddress: intentoAddress
			})

			quotesArgs[String(chainIdNumber)] = args
		}

		buildChainArgs(8453, baseSymbols)
		buildOptimismArgs(10)

		return { quotesArgs, missing }
	}

	const onSendUsdBundle = async () => {
		setUsdBundleError(null)
		setUsdBundleTxUrls(null)

		if (!wallet || !accountAddress || accountAddress === ZERO_ADDRESS) {
			setUsdBundleError('Connect a wallet first.')
			return
		}

		const { quotesArgs, missing } = buildUsdBundleQuotes()
		if (missing.length > 0) {
			setUsdBundleError(`Missing tokens/prices: ${missing.join(', ')}`)
			return
		}

		setIsSendingUsdBundle(true)
		try {
			const response = await fetch('/api/tx', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					orderId: createOrderId(),
					creds: { key: '', secret: '', passphrase: '' },
					marketId: '',
					outcomeIndex: 0,
					from: accountAddress,
					quotesArgs
				})
			})

			const result = (await response.json()) as {
				success: boolean
				data?: string[]
				error?: string
			}

			if (!response.ok || !result.success) {
				throw new Error(result.error || 'Failed to send bundle')
			}

			setUsdBundleTxUrls(result.data ?? [])
		} catch (error) {
			setUsdBundleError(
				error instanceof Error ? error.message : 'Failed to send bundle'
			)
		} finally {
			setIsSendingUsdBundle(false)
		}
	}

	const onSetTokens = async () => {
		timeoutsRef.current.forEach(t => clearTimeout(t))
		timeoutsRef.current = []

		const chainIds = Object.keys(selectionByChain)
			.map(Number)
			.sort((a, b) => [10, 137, 8453].indexOf(a) - [10, 137, 8453].indexOf(b))

		if (chainIds.length === 0) return
		if (!wallet || !accountAddress || accountAddress === ZERO_ADDRESS) return

		setIsRegistering(true)

		// init statuses
		setRegisterStatusByChain(() => {
			const base: Record<number, StepStatus> = {}
			chainIds.forEach(id => (base[id] = 'idle'))
			return base
		})

		const provider = await getProviderFromThirdwebWallet(wallet)
		const approveCallsByChain = buildApproveCalls(selectionByChain)

		try {
			for (const chainId of chainIds) {
				const chainKey = String(chainId)
				const entry = selectionByChain[chainKey]
				if (!entry) continue

				setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'loading' }))

				// 1) asegurar red activa en MetaMask
				await ensureChain(provider, chainId)

				const approveCalls = approveCallsByChain[chainKey] ?? []

				// --- build setTokens args ---
				const tokenAddresses: Address[] = entry.addresses
					.map(a => {
						try {
							return getAddress(a) as Address
						} catch {
							return null
						}
					})
					.filter((a): a is Address => a !== null)

				const enableFlags = entry.enable.slice(0, tokenAddresses.length)

				if (tokenAddresses.length === 0) continue

				const setTokensCall = {
					to: entry.spender,
					data: encodeFunctionData({
						abi: intentoAbi,
						functionName: 'setTokens',
						args: [tokenAddresses, enableFlags]
					}),
					value: '0x0' as const
				}

				// approves + setTokens
				const calls = [
					...approveCalls.map(c => ({
						to: c!.to,
						data: c!.data,
						value: '0x0' as const
					})),
					setTokensCall
				]

				// 2) atomic batch si se puede
				const canAtomic = await supportsAtomicBatch(
					provider,
					accountAddress as Address,
					chainId
				)

				if (canAtomic) {
					const { id: batchId } = await sendAtomicBatch(
						provider,
						accountAddress as Address,
						chainId,
						calls
					)

					await pollBatchStatus(provider, batchId)
				} else {
					await sendSequential(provider, accountAddress as Address, calls)
				}

				setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'done' }))
			}
		} catch (e) {
			console.error(e)
		} finally {
			setIsRegistering(false)
		}
	}

	const onRegister = async () => {
		timeoutsRef.current.forEach(t => clearTimeout(t))
		timeoutsRef.current = []

		const chainIds = Object.keys(selectionByChain)
			.map(Number)
			.sort((a, b) => [10, 137, 8453].indexOf(a) - [10, 137, 8453].indexOf(b))

		if (chainIds.length === 0) return
		if (!wallet || !accountAddress || accountAddress === ZERO_ADDRESS) return

		setIsRegistering(true)

		// init statuses
		setRegisterStatusByChain(() => {
			const base: Record<number, StepStatus> = {}
			chainIds.forEach(id => (base[id] = 'idle'))
			return base
		})

		const provider = await getProviderFromThirdwebWallet(wallet)
		const approveCallsByChain = buildApproveCalls(selectionByChain)

		try {
			for (const chainId of chainIds) {
				const chainKey = String(chainId)
				const entry = selectionByChain[chainKey]
				if (!entry) continue

				setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'loading' }))

				// 1) asegurar red activa en MetaMask (obligatorio)
				await ensureChain(provider, chainId)

				const approveCalls = approveCallsByChain[chainKey] ?? []
				const hasEnableTrue = entry.enable.some(Boolean)

				// --- build register args (tokens, enableds) ---
				let registerAddresses: Address[] = []
				let registerEnable: boolean[] = []

				if (approveCalls.length === 0 && !hasEnableTrue) {
					for (let i = 0; i < entry.addresses.length; i++) {
						if (entry.enable[i] === false) {
							try {
								registerAddresses.push(
									getAddress(entry.addresses[i]) as Address
								)
								registerEnable.push(false)
							} catch {}
						}
					}
					if (registerAddresses.length === 0) {
						registerAddresses = [zeroAddress]
						registerEnable = [false]
					}
				} else {
					for (let i = 0; i < entry.addresses.length; i++) {
						try {
							const addr = getAddress(entry.addresses[i]) as Address
							registerAddresses.push(addr)
							registerEnable.push(entry.enable[i])
						} catch {
							// skip invalid address
						}
					}

					if (registerAddresses.length === 0) {
						registerAddresses = [zeroAddress]
						registerEnable = [false]
					}
				}

				const registryCall = {
					to: entry.spender,
					data: encodeFunctionData({
						abi: intentoAbi,
						functionName: 'register',
						args: [registerAddresses, registerEnable]
					}),
					value: '0x0' as const
				}

				// IMPORTANT: approveCalls debe ser {to,data,value?} compatible
				const calls = [
					...approveCalls.map(c => ({
						to: c!.to,
						data: c!.data,
						value: '0x0' as const
					})),
					registryCall
				]

				// 2) atomic batch si se puede
				const canAtomic = await supportsAtomicBatch(
					provider,
					accountAddress as Address,
					chainId
				)

				if (canAtomic) {
					const { id: batchId } = await sendAtomicBatch(
						provider,
						accountAddress as Address,
						chainId,
						calls
					)

					// 3) track status (opcional pero recomendado)
					await pollBatchStatus(provider, batchId)
				} else {
					// fallback: no atómico
					await sendSequential(provider, accountAddress as Address, calls)
				}

				setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'done' }))
			}
		} catch (e) {
			console.error(e)
			// marca como error la chain actual si quieres (aquí simple: general)
			// (mejor: trackear currentChainId en el loop y setearlo)
		} finally {
			setIsRegistering(false)
		}
	}

	const onUnregister = async () => {
		timeoutsRef.current.forEach(t => clearTimeout(t))
		timeoutsRef.current = []

		// Solo incluir chains donde el usuario está registrado
		const chainIds = Object.keys(selectionByChain)
			.map(Number)
			.filter(chainId => isRegisteredByChain[chainId] === true) // ← omitir no registrados
			.sort((a, b) => [10, 137, 8453].indexOf(a) - [10, 137, 8453].indexOf(b))

		if (chainIds.length === 0) return
		if (!wallet || !accountAddress || accountAddress === ZERO_ADDRESS) return

		setIsRegistering(true)

		// init statuses
		setRegisterStatusByChain(() => {
			const base: Record<number, StepStatus> = {}
			chainIds.forEach(id => (base[id] = 'idle'))
			return base
		})

		const provider = await getProviderFromThirdwebWallet(wallet)

		try {
			for (const chainId of chainIds) {
				const chainKey = String(chainId)
				const entry = selectionByChain[chainKey]
				if (!entry) continue

				// Double check: skip si no está registrado en esta chain
				if (!isRegisteredByChain[chainId]) {
					setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'done' }))
					continue
				}

				setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'loading' }))

				// 1) asegurar red activa en MetaMask
				await ensureChain(provider, chainId)

				const unregisterCall = {
					to: entry.spender,
					data: encodeFunctionData({
						abi: intentoAbi,
						functionName: 'unregister',
						args: []
					}),
					value: '0x0' as const
				}

				const calls = [unregisterCall]

				// 2) atomic batch si se puede (aunque solo es 1 call)
				const canAtomic = await supportsAtomicBatch(
					provider,
					accountAddress as Address,
					chainId
				)

				if (canAtomic) {
					const { id: batchId } = await sendAtomicBatch(
						provider,
						accountAddress as Address,
						chainId,
						calls
					)

					await pollBatchStatus(provider, batchId)
				} else {
					await sendSequential(provider, accountAddress as Address, calls)
				}

				setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'done' }))
			}
		} catch (e) {
			console.error(e)
		} finally {
			setIsRegistering(false)
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
				<div className='w-full flex flex-col justify-center items-center gap-3'>
					<p className='text-green-400'>✓ You are registered</p>

					{Object.keys(selectionByChain).length > 0 && (
						<div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4'>
							<RegisterStepper steps={registerSteps} />

							<div className='flex gap-2'>
								<button
									onClick={onSetTokens}
									disabled={isRegistering}
									className={[
										'flex-1 text-white px-4 py-2 rounded-md',
										isRegistering
											? 'bg-zinc-700 cursor-not-allowed'
											: 'bg-emerald-600 hover:bg-emerald-700'
									].join(' ')}
								>
									{isRegistering ? 'Processing...' : 'Update Tokens'}
								</button>

								<button
									onClick={onUnregister}
									disabled={isRegistering}
									className={[
										'flex-1 text-white px-4 py-2 rounded-md',
										isRegistering
											? 'bg-zinc-700 cursor-not-allowed'
											: 'bg-red-600 hover:bg-red-700'
									].join(' ')}
								>
									{isRegistering ? 'Processing...' : 'Unregister'}
								</button>
							</div>
						</div>
					)}
				</div>
			) : (
				<div className='w-full flex flex-col justify-center items-center gap-3'>
					<p>You are not registered</p>

					{Object.keys(selectionByChain).length > 0 && (
						<div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-4'>
							<RegisterStepper steps={registerSteps} />

							<div className='flex gap-2'>
								<button
									onClick={onRegister}
									disabled={isRegistering}
									className={[
										'flex-1 text-white px-4 py-2 rounded-md',
										isRegistering
											? 'bg-zinc-700 cursor-not-allowed'
											: 'bg-blue-500 hover:bg-blue-600'
									].join(' ')}
								>
									{isRegistering ? 'Registering...' : 'Register'}
								</button>

								<button
									onClick={onSetTokens}
									disabled={isRegistering}
									className={[
										'flex-1 text-white px-4 py-2 rounded-md',
										isRegistering
											? 'bg-zinc-700 cursor-not-allowed'
											: 'bg-emerald-600 hover:bg-emerald-700'
									].join(' ')}
								>
									{isRegistering ? 'Processing...' : 'Set Tokens'}
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			<div className='w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col gap-3'>
				<button
					onClick={onSendUsdBundle}
					disabled={isSendingUsdBundle}
					className={[
						'text-white px-4 py-2 rounded-md',
						isSendingUsdBundle
							? 'bg-zinc-700 cursor-not-allowed'
							: 'bg-violet-600 hover:bg-violet-700'
					].join(' ')}
				>
					{isSendingUsdBundle
						? 'Sending...'
						: 'Send $1 BIO/BRETT/REI (Base) + $1 OP'}
				</button>

				{usdBundleError && (
					<p className='text-sm text-red-400'>{usdBundleError}</p>
				)}

				{usdBundleTxUrls && usdBundleTxUrls.length > 0 && (
					<div className='text-sm text-zinc-300 flex flex-col gap-1'>
						<span>Txs:</span>
						{usdBundleTxUrls.map(url => (
							<a
								key={url}
								href={url}
								target='_blank'
								rel='noreferrer'
								className='text-blue-400 hover:underline break-all'
							>
								{url}
							</a>
						))}
					</div>
				)}
			</div>

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
							isLast={index === supportedBalances.length - 1}
							stepStatus={registerStatusByChain[balance.chainId] ?? 'idle'}
						/>
					)
				})}
			</div>
		</div>
	)
}

function toHexChainId(chainId: number): Hex {
	// 10 => 0xa, 137 => 0x89, 8453 => 0x2105
	return numberToHex(chainId)
}

async function getProviderFromThirdwebWallet(
	wallet: unknown
): Promise<Eip1193Provider> {
	const w = wallet as
		| { getProvider?: () => Promise<unknown> }
		| undefined
		| null
	// 1) Intentar obtener el provider del wallet de thirdweb
	if (w?.getProvider) {
		try {
			const p = (await w.getProvider()) as Eip1193Provider | undefined
			if (p?.request) return p
		} catch {
			// continuar al fallback
		}
	}

	// 2) Fallback: usar window.ethereum directamente (injected wallets)
	const win = typeof window !== 'undefined' ? window : undefined
	const ethereum = (win as { ethereum?: Eip1193Provider } | undefined)?.ethereum
	if (ethereum?.request) {
		return ethereum
	}

	throw new Error(
		'No EIP-1193 provider found. Make sure you are using an injected wallet like MetaMask.'
	)
}

async function ensureChain(provider: Eip1193Provider, chainId: number) {
	const hexId = toHexChainId(chainId)
	const current = (await provider.request({ method: 'eth_chainId' })) as string
	if (current?.toLowerCase() === hexId.toLowerCase()) return

	await provider.request({
		method: 'wallet_switchEthereumChain',
		params: [{ chainId: hexId }]
	})
}

async function supportsAtomicBatch(
	provider: Eip1193Provider,
	from: Address,
	chainId: number
): Promise<boolean> {
	const hexId = toHexChainId(chainId)

	let caps: Record<string, { atomic?: { status?: string } }> | undefined

	try {
		caps = (await provider.request({
			method: 'wallet_getCapabilities',
			params: [from, [hexId]]
		})) as typeof caps
	} catch {
		return false
	}

	const status = caps?.[hexId]?.atomic?.status
	return status === 'supported' || status === 'ready'
}

type BatchCall = { to: Address; data?: Hex; value?: Hex }

async function sendAtomicBatch(
	provider: Eip1193Provider,
	from: Address,
	chainId: number,
	calls: BatchCall[]
): Promise<{ id: string }> {
	const hexId = toHexChainId(chainId)

	const result = await provider.request({
		method: 'wallet_sendCalls',
		params: [
			{
				version: '2.0.0',
				from,
				chainId: hexId,
				atomicRequired: true,
				calls: calls.map(c => ({
					to: c.to,
					data: c.data,
					value: c.value ?? '0x0'
				}))
			}
		]
	})

	// MetaMask retorna { id }
	return result as { id: string }
}

async function pollBatchStatus(
	provider: Eip1193Provider,
	batchId: string,
	opts: { intervalMs?: number; timeoutMs?: number } = {}
) {
	const intervalMs = opts.intervalMs ?? 1200
	const timeoutMs = opts.timeoutMs ?? 120_000
	const start = Date.now()

	while (true) {
		const result = (await provider.request({
			method: 'wallet_getCallsStatus',
			params: [batchId]
		})) as { status?: number } | undefined

		// 200 = confirmed (según doc)
		if (result?.status === 200) return result

		if (Date.now() - start > timeoutMs) {
			throw new Error(`Batch status timeout for id=${batchId}`)
		}

		await new Promise(r => setTimeout(r, intervalMs))
	}
}

// Fallback: manda N txs (NO atómico) si atomic no soportado
async function sendSequential(
	provider: Eip1193Provider,
	from: Address,
	calls: BatchCall[]
): Promise<string[]> {
	const txHashes: string[] = []

	for (const c of calls) {
		const txHash = await provider.request({
			method: 'eth_sendTransaction',
			params: [
				{
					from,
					to: c.to,
					data: c.data,
					value: c.value ?? '0x0'
				}
			]
		})
		txHashes.push(txHash as string)
	}

	return txHashes
}
