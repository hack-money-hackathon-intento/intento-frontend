import {
  type Address,
  encodeFunctionData,
  erc20Abi,
  getAddress,
  type Hex,
  maxUint256,
  zeroAddress
} from 'viem'

type Call = { to: Address; data: Hex }

type ParticipatingTokens = Record<
  string,
  {
    spender: Address
    addresses: string[]
    enable: boolean[]
    balances: bigint[]
    allowances: bigint[]
  }
>

export function buildApproveCalls(
  participatingTokens: ParticipatingTokens
): Record<string, Call[]> {
  const outByChain: Record<string, Call[]> = {}

  for (const [chainId, entry] of Object.entries(participatingTokens)) {
    const spender = entry.spender
    if (!spender) throw new Error(`Missing spender for chainId=${chainId}`)

    const { addresses, enable, balances, allowances } = entry
    const length = addresses.length

    if (
      enable.length !== length ||
      balances.length !== length ||
      allowances.length !== length
    ) {
      throw new Error(`MISMATCH arrays for chainId=${chainId}`)
    }

    const chainCalls: Call[] = []

    for (let i = 0; i < length; i++) {
      // ✅ si el usuario NO quiere habilitar, no crees approvals
      if (!enable[i]) continue

      const addr = addresses[i]
      if (!addr) continue

      let tokenAddress: Address
      try {
        tokenAddress = getAddress(addr)
      } catch {
        continue
      }

      // native no se aprueba
      if (tokenAddress === zeroAddress) continue

      const amountNeeded = balances[i] ?? BigInt(0)
      if (amountNeeded === BigInt(0)) continue

      const allowance = allowances[i] ?? BigInt(0)
      if (allowance >= amountNeeded) continue

      // si ya está “casi infinito”, no hagas nada
      if (allowance >= maxUint256 / BigInt(2)) continue

      // compat USDT: si allowance > 0, reset antes
      if (allowance > BigInt(0)) {
        chainCalls.push({
          to: tokenAddress,
          data: encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [spender, BigInt(0)]
          })
        })
      }

      chainCalls.push({
        to: tokenAddress,
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: 'approve',
          args: [spender, maxUint256]
        })
      })
    }

    if (chainCalls.length > 0) {
      outByChain[chainId] = chainCalls
    }
  }

  return outByChain
}
