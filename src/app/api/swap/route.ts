import { NextRequest, NextResponse } from 'next/server'

import { oneInchService } from '@/services/rest/one-inch'

export async function GET(request: NextRequest) {
	try {
		const { getTokens } = oneInchService()

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

		const result = await getTokens(chainIdNumber)

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
