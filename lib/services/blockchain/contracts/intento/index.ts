import { ZERO_ADDRESS } from 'thirdweb'
import { ChainOptions } from 'thirdweb/chains'
import { Account } from 'thirdweb/wallets'
import { Address, Hex } from 'viem'

import { intentoAbi } from '@/lib/assets/abis'
import { parseContractError } from '@/lib/config/contract.config'
import { ServiceResult } from '@/lib/models/api.model'

import { BaseContract } from '../../base-contract'

export class IntentoContract extends BaseContract {
	constructor(
		contractAddress: Address,
		chain: Readonly<ChainOptions & { rpc: string }>,
		account?: Account
	) {
		super(
			{
				proxy: contractAddress,
				implementation: ZERO_ADDRESS,
				abi: intentoAbi
			},
			chain,
			account
		)
	}

	// =========================
	//        READ METHODS
	// =========================

	async areTokensEnabled(
		account: Address,
		tokens: Address[]
	): Promise<boolean[]> {
		try {
			const enableds = await this.read<boolean[]>('areTokensEnabled', [
				account,
				tokens
			])
			return enableds
		} catch (error) {
			console.error('❌', error)
			return []
		}
	}

	async isRegistered(account: Address): Promise<boolean> {
		try {
			const isRegistered = await this.read<boolean>('isRegistered', [account])
			return isRegistered
		} catch (error) {
			console.error('❌', error)
			return false
		}
	}

	// =========================
	//        WRITE METHODS
	// =========================

	async setTokens(
		tokens: Address[],
		enableds: boolean[]
	): Promise<ServiceResult<Hex>> {
		try {
			const hash = await this.write('setTokens', [tokens, enableds])
			return { success: true, data: hash as Hex }
		} catch (error) {
			const parsedError = parseContractError(error, 'approve')
			console.error('❌', parsedError)
			return { success: false, error: parsedError }
		}
	}

	async register(tokens: Address[]): Promise<ServiceResult<Hex>> {
		try {
			const hash = await this.write('register', [tokens])
			return { success: true, data: hash as Hex }
		} catch (error) {
			const parsedError = parseContractError(error, 'approve')
			console.error('❌', parsedError)
			return { success: false, error: parsedError }
		}
	}
}
