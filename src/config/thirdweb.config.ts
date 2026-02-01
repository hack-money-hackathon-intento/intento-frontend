import { Chain, createThirdwebClient } from 'thirdweb'
import {
	arbitrum,
	avalanche,
	base,
	ethereum,
	optimism,
	polygon
} from 'thirdweb/chains'

import arbitrumIcon from '@/assets/img/blockchains/arbitrum.svg'
import avalancheIcon from '@/assets/img/blockchains/avalanche.svg'
import baseIcon from '@/assets/img/blockchains/avalanche.svg'
import ethereumIcon from '@/assets/img/blockchains/ethereum.svg'
import optimismIcon from '@/assets/img/blockchains/optimism.svg'
import polygonIcon from '@/assets/img/blockchains/polygon.svg'
import { ensureEnvVar } from '@/helpers/ensure-env.helper'

const clientId = ensureEnvVar(
	process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
	'NEXT_PUBLIC_THIRDWEB_CLIENT_ID'
)

export const client = createThirdwebClient({
	clientId
})

export const chains: Chain[] = [
	{ ...arbitrum, name: 'Arbitrum', icon: arbitrumIcon },
	{ ...avalanche, name: 'Avalanche', icon: avalancheIcon },
	{ ...base, name: 'Base', icon: baseIcon },
	{ ...ethereum, name: 'Ethereum', icon: ethereumIcon },
	{ ...optimism, name: 'Optimism', icon: optimismIcon },
	{ ...polygon, name: 'Polygon', icon: polygonIcon }
]
