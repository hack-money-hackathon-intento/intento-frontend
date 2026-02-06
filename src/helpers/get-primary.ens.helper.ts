import { Address, createPublicClient, getAddress, http, isAddress } from 'viem'
import { mainnet } from 'viem/chains'

const client = createPublicClient({
	chain: mainnet,
	transport: http(mainnet.rpcUrls.default.http[0])
})

export async function getPrimaryEns(address: Address): Promise<boolean> {
	if (!isAddress(address)) return false

	const checksum = getAddress(address)

	let ens: string | null = null
	try {
		ens = await client.getEnsName({ address: checksum })
	} catch {
		return false
	}
	if (!ens) return false

	// forward check recomendado (para que sea “primary name” válido) :contentReference[oaicite:5]{index=5}
	let resolved: Address | null = null
	try {
		resolved = await client.getEnsAddress({ name: ens })
	} catch {
		return false
	}
	if (!resolved) return false

	return getAddress(resolved) === checksum ? true : false
}
