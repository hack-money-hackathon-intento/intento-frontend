import { Address, Hex, numberToHex } from 'viem'

type Eip1193Provider = {
	request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export function toHexChainId(chainId: number): Hex {
	// 10 => 0xa, 137 => 0x89, 8453 => 0x2105
	return numberToHex(chainId)
}

export async function getProviderFromThirdwebWallet(
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

export async function ensureChain(provider: Eip1193Provider, chainId: number) {
	const hexId = toHexChainId(chainId)
	const current = (await provider.request({ method: 'eth_chainId' })) as string
	if (current?.toLowerCase() === hexId.toLowerCase()) return

	await provider.request({
		method: 'wallet_switchEthereumChain',
		params: [{ chainId: hexId }]
	})
}

export async function supportsAtomicBatch(
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

export type BatchCall = { to: Address; data?: Hex; value?: Hex }

export async function sendAtomicBatch(
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

export async function pollBatchStatus(
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
export async function sendSequential(
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
