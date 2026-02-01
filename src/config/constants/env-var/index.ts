import { ensureEnvVar } from '@/helpers/ensure-env.helper'

export function verifyEnvVars() {
	const { ONE_INCH_API_KEY } = process.env

	const register = {
		oneInch: {
			apiKey: ensureEnvVar(ONE_INCH_API_KEY, 'NEXT_PUBLIC_ONE_INCH_API_KEY')
		}
	}

	return {
		register
	}
}
