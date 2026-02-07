import { type Address, getAddress } from 'viem'

import type { Balances, Token } from '@/lib/models/balances'

import type {
	Asset,
	Bucket,
	WalletResponse,
	WalletSnapshot
} from '../dtos/wallet.dto'

const WALLET_PROTOCOL_KEY = 'wallet'
const WALLET_POSITIONS_KEY = 'WALLET'

function getWalletBucket(snapshot: WalletSnapshot): Bucket | undefined {
	// prefer direct key
	if (snapshot.assetByProtocols?.[WALLET_PROTOCOL_KEY]) {
		return snapshot.assetByProtocols[WALLET_PROTOCOL_KEY]
	}

	// fallback: find by bucket.key === 'wallet'
	return Object.values(snapshot.assetByProtocols ?? {}).find(
		b => b.key === WALLET_PROTOCOL_KEY
	)
}

function safeGetAddress(addr: string): Address | null {
	try {
		return getAddress(addr) as Address
	} catch {
		return null
	}
}

export function mapWalletResponseToBalances(
	walletResponse: WalletResponse
): Balances[] {
	const byChainId = new Map<number, Balances>()

	for (const snapshot of walletResponse ?? []) {
		const walletBucket = getWalletBucket(snapshot)
		if (!walletBucket) continue

		for (const [chainKey, chainBucket] of Object.entries(
			walletBucket.chains ?? {}
		)) {
			const chainIdStr = snapshot.chains?.[chainKey]?.chainId
			const chainId = Number(chainIdStr)
			if (!Number.isFinite(chainId)) continue

			const assets: Asset[] =
				chainBucket.protocolPositions?.[WALLET_POSITIONS_KEY]?.assets ?? []

			if (assets.length === 0) continue

			const tokens = assets
				.map((asset): Token | null => {
					const addr = safeGetAddress(asset.contract)
					if (!addr) return null

					return {
						address: addr,
						symbol: asset.symbol,
						decimals: Number(asset.decimal),
						amount: asset.balance,
						name: asset.name,
						chainId,
						priceUSD: asset.price,
						logoURI: asset.imgLarge ?? asset.imgSmall
					}
				})
				.filter((t): t is Token => t !== null)

			if (tokens.length === 0) continue

			const existing = byChainId.get(chainId)
			if (existing) {
				existing.tokens.push(...tokens)
			} else {
				byChainId.set(chainId, { chainId, tokens })
			}
		}
	}

	return [...byChainId.values()].sort((a, b) => a.chainId - b.chainId)
}
