import { NextRequest, NextResponse } from 'next/server'
import { Address, getAddress } from 'viem'

import { oneInchService } from '@/services/rest/one-inch'

export async function GET(request: NextRequest) {
	try {
		const { getPrices } = oneInchService()

		const { searchParams } = new URL(request.url)

		const chainId = searchParams.get('chainId')

		if (!chainId) {
			return NextResponse.json(
				{ success: false, error: 'Chain ID is required' },
				{ status: 400 }
			)
		}

		const chainIdNumber = parseInt(chainId)

		if (isNaN(chainIdNumber)) {
			return NextResponse.json(
				{ success: false, error: `Chain ID is invalid: ${chainId}` },
				{ status: 400 }
			)
		}

		const addresses = searchParams.get('addresses')

		if (!addresses) {
			return NextResponse.json(
				{ success: false, error: 'Addresses are required' },
				{ status: 400 }
			)
		}

		const summedAddresses = addresses
			.split(',')
			.map(address => getAddress(address as Address))

		const result = await getPrices(chainIdNumber, summedAddresses)

		if (!result.success) {
			return NextResponse.json({ success: false, error: result.error })
		}

		return NextResponse.json({ success: true, data: result.data })
	} catch (error) {
		console.error('❌', error)
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
