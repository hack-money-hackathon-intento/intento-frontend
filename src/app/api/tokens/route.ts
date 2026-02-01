import { NextRequest, NextResponse } from 'next/server'

import { liFiService } from '@/services/rest/li-fi'

export async function GET(_request: NextRequest) {
	try {
		const { getTokens } = liFiService()

		const result = await getTokens()

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
