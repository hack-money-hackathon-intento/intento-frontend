import {
	type Address,
	encodeFunctionData,
	erc20Abi,
	getAddress,
	type Hex,
	maxUint256,
	zeroAddress
} from 'viem'

type Call = { to: Address; data: Hex }
type CallsByToken = (Call[] | null)[]

type ParticipatingTokens = Record<
	string,
	{
		spender: Address
		addresses: string[]
		enable: boolean[]
		balances: bigint[]
		allowances: bigint[]
		calls?: CallsByToken // 1:1 con addresses
	}
>

export function buildApproveCalls(
	participatingTokens: ParticipatingTokens
): ParticipatingTokens {
	const out: ParticipatingTokens = {}

	for (const [chainId, entry] of Object.entries(participatingTokens)) {
		const spender = entry.spender
		if (!spender) throw new Error(`Missing spender for chainId=${chainId}`)

		const { addresses, enable, balances, allowances } = entry
		const length = addresses.length

		if (
			enable.length !== length ||
			balances.length !== length ||
			allowances.length !== length
		) {
			throw new Error(`MISMATCH arrays for chainId=${chainId}`)
		}

		// calls alineado con addresses
		const calls: CallsByToken = new Array(length).fill(null)

		for (let i = 0; i < length; i++) {
			// solo si el usuario quiere habilitar
			if (!enable[i]) {
				calls[i] = null
				continue
			}

			const addr = addresses[i]
			if (!addr) {
				calls[i] = null
				continue
			}

			let tokenAddress: Address
			try {
				tokenAddress = getAddress(addr)
			} catch {
				calls[i] = null
				continue
			}

			// native token no se aprueba
			if (tokenAddress === zeroAddress) {
				calls[i] = null
				continue
			}

			const amountNeeded = balances[i] ?? BigInt(0)
			if (amountNeeded === 0n) {
				calls[i] = null
				continue
			}

			const allowance = allowances[i] ?? BigInt(0)
			if (allowance >= amountNeeded) {
				calls[i] = null
				continue
			}

			// si ya está “casi infinito”, no hagas nada
			if (allowance >= maxUint256 / BigInt(2)) {
				calls[i] = null
				continue
			}

			const tokenCalls: Call[] = []

			// compat USDT: si allowance > 0, reset antes
			if (allowance > 0n) {
				tokenCalls.push({
					to: tokenAddress,
					data: encodeFunctionData({
						abi: erc20Abi,
						functionName: 'approve',
						args: [spender, BigInt(0)]
					})
				})
			}

			tokenCalls.push({
				to: tokenAddress,
				data: encodeFunctionData({
					abi: erc20Abi,
					functionName: 'approve',
					args: [spender, maxUint256]
				})
			})

			calls[i] = tokenCalls
		}

		// Solo agrega calls si realmente hay al menos un token con calls
		const hasAny = calls.some(v => v && v.length > 0)

		out[chainId] = {
			...entry,
			calls: hasAny ? calls : undefined
		}
	}

	return out
}
