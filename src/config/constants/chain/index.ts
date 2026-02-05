import { base, optimism, polygon } from 'viem/chains'

const CHAINS = {
	[base.id]: base,
	[optimism.id]: optimism,
	[polygon.id]: polygon
}

export { CHAINS }
