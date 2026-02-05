import { encodeAbiParameters, Hex } from 'viem'

import { LiFiRoute } from '@/models/li-fi-route.model'

export function routeToBytes(route: LiFiRoute): Hex {
	const { to, approval, value, data } = route.route

	return encodeAbiParameters(
		[
			{ name: 'to', type: 'address' },
			{ name: 'approval', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'data', type: 'bytes' }
		],
		[to, approval, value, data]
	)
}
