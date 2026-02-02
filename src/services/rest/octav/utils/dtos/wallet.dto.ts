export type WalletResponse = WalletSnapshot[]

//  uses "N/A" in several numeric-ish fields
export type NAString = 'N/A' | string

export interface WalletSnapshot {
	address: string

	// e.g. { ETH: "2318.91", SOL: "103.48...", ... }
	conversionRates: Record<string, string>

	cashBalance: string

	closedPnl: NAString
	openPnl: NAString

	dailyIncome: string
	dailyExpense: string

	fees: string
	feesFiat: string

	// looks like ms timestamp but provided as string in your payload
	lastUpdated: string

	priceAdapters: string[]

	manualBalanceNetworth: string
	networth: string

	totalCostBasis: NAString

	// keyed by protocol key (in your example: "wallet")
	assetByProtocols: Record<string, Bucket>

	// chain summaries keyed by chain key (base/ethereum/optimism/polygon/...)
	chains: Record<string, ChainSummary>

	// empty objects in your sample, keep flexible
	nftChains: Record<string, unknown>
	nftsByCollection: Record<string, unknown>
}

export interface Bucket {
	uuid: string
	name: string
	key: string

	imgSmall: string
	imgLarge: string

	value: string

	totalCostBasis: NAString
	totalClosedPnl: NAString
	totalOpenPnl: NAString

	// detailed positions per chain
	chains: Record<string, ChainBucket>
}

export interface ChainBucket {
	name: string
	key: string

	imgSmall: string
	imgLarge: string

	color: string

	value: string

	explorerAddressUrl: string | null
	blockscoutExplorerAddressUrl: string

	totalCostBasis: NAString
	totalClosedPnl: NAString
	totalOpenPnl: NAString

	// keyed by protocol position group (in your example: "WALLET")
	protocolPositions: Record<string, PositionsBucket>
}

export interface PositionsBucket {
	assets: Asset[]
	name: string

	// you had [] but structure can vary; keep flexible
	protocolPositions: unknown[]

	totalOpenPnl: NAString
	totalCostBasis: NAString

	totalValue: string

	// in your sample it's "0" as a string
	unlockAt: string | number
}

export interface Asset {
	balance: string

	// e.g. "base:0x0000..."
	chainContract: string
	chainKey: string

	contract: string

	//  sends this as string (e.g. "18", "6", "9")
	decimal: string

	explorerUrl: string
	blockscoutExplorerUrl: string

	imgSmall: string
	imgLarge: string

	name: string

	openPnl: NAString

	// null in your sample
	Balance: unknown | null

	price: string
	priceSource: string

	// sometimes "1"/"2"/"10", sometimes null
	rank: string | null

	symbol: string

	totalCostBasis: NAString

	value: string

	uuid: string
}

export interface ChainSummary {
	name: string
	key: string

	// in your sample: "8453", "1", "10", "137" as strings
	chainId: string

	imgSmall: string
	imgLarge: string

	color: string

	value: string

	// appears as string percentile
	valuePercentile: string

	totalCostBasis: NAString
	totalClosedPnl: NAString
	totalOpenPnl: NAString
}
