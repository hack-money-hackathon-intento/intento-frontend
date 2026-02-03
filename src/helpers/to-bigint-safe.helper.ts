export const toBigIntSafe = (value: unknown) => {
	try {
		if (typeof value === 'bigint') return value
		if (typeof value === 'number') return BigInt(Math.trunc(value))
		if (typeof value === 'string') return BigInt(value)
		return BigInt(0)
	} catch {
		return BigInt(0)
	}
}
