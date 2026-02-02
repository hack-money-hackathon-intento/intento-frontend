import { ZERO_ADDRESS } from 'thirdweb'
import { ChainOptions } from 'thirdweb/chains'
import { Account } from 'thirdweb/wallets'
import { Address, erc20Abi, formatUnits, Hex } from 'viem'

import { parseContractError } from '@/config/contract.config'
import { ServiceResult } from '@/models/api.model'

import { BaseContract } from '../../base-contract'

export class ERC20Contract extends BaseContract {
	decimals = 0

	constructor(
		contractAddress: Address,
		chain: Readonly<ChainOptions & { rpc: string }>,
		account?: Account
	) {
		super(
			{
				proxy: contractAddress,
				implementation: ZERO_ADDRESS,
				abi: erc20Abi
			},
			chain,
			account
		)
	}

	// =========================
	//        READ METHODS
	// =========================

	async allowance(owner: Address, spender: Address): Promise<bigint> {
		try {
			const value = await this.read<bigint>('allowance', [owner, spender])
			return value
		} catch (error) {
			console.error('❌', error)
			return BigInt(0)
		}
	}

	async balanceOf(
		address: Address
	): Promise<{ balance: number; rawBalance: bigint }> {
		try {
			const [balance, decimals] = await Promise.all([
				this.read<bigint>('balanceOf', [address]),
				this.getDecimals()
			])

			const formattedBalance = formatUnits(balance, decimals)
			return { balance: Number(formattedBalance), rawBalance: balance }
		} catch (error) {
			console.error('❌', error)
			return { balance: 0, rawBalance: BigInt(0) }
		}
	}

	private async getDecimals(): Promise<number> {
		try {
			const decimals = await this.read<bigint>('decimals', [])
			this.decimals = Number(decimals)
			return this.decimals
		} catch (error) {
			console.error('❌', error)
			return 0
		}
	}

	// =========================
	//        WRITE METHODS
	// =========================

	async approve(spender: Address, amount: bigint): Promise<ServiceResult<Hex>> {
		try {
			const hash = await this.write('approve', [spender, amount])
			return { success: true, data: hash as Hex }
		} catch (error) {
			const parsedError = parseContractError(error, 'approve')
			console.error('❌', parsedError)
			return { success: false, error: parsedError }
		}
	}
}
