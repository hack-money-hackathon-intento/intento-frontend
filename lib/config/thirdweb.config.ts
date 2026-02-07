import { Chain, createThirdwebClient } from 'thirdweb'
import {
	arbitrum,
	avalanche,
	base,
	ethereum,
	optimism,
	polygon
} from 'thirdweb/chains'

import { ensureEnvVar } from '@/lib/helpers/ensure-env.helper'

const clientId = ensureEnvVar(
	process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
	'NEXT_PUBLIC_THIRDWEB_CLIENT_ID'
)

export const client = createThirdwebClient({
	clientId
})

export const chains: Chain[] = [
	{ ...arbitrum, name: 'Arbitrum' },
	{ ...avalanche, name: 'Avalanche' },
	{ ...base, name: 'Base' },
	{ ...ethereum, name: 'Ethereum' },
	{ ...optimism, name: 'Optimism' },
	{ ...polygon, name: 'Polygon' }
]
