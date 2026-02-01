import type { Address, Chain } from 'thirdweb'
import {
	getContract,
	prepareContractCall,
	readContract,
	sendTransaction,
	type ThirdwebClient,
	waitForReceipt
} from 'thirdweb'
import { ChainOptions } from 'thirdweb/chains'
import { Account } from 'thirdweb/wallets'
import { Abi } from 'viem'

import { client } from '@/config/thirdweb.config'

export type ContractJson = {
	proxy: Address
	implementation: Address
	abi: Abi
}

export class BaseContract {
	private address: Address
	private abi: Abi
	private client: ThirdwebClient
	private chain: Chain
	private account?: Account

	constructor(
		contractJson: ContractJson,
		chain: Readonly<ChainOptions & { rpc: string }>,
		account?: Account
	) {
		this.address = contractJson.proxy
		this.abi = contractJson.abi
		this.client = client
		this.chain = chain
		this.account = account
	}

	// =========================
	//         GETTERS
	// =========================

	public getAddress() {
		return this.address
	}

	public getAbi() {
		return this.abi
	}

	public getClient() {
		return this.client
	}

	public getChain() {
		return this.chain
	}

	public getAccount() {
		return this.account
	}

	public getContract() {
		return this.getContractInstance()
	}

	// =========================
	//         SETTERS
	// =========================

	public setAccount(account?: Account) {
		this.account = account
	}

	// =========================
	//         PROTECTED
	// =========================

	protected async read<T = unknown>(method: string, params: unknown[] = []) {
		const contract = this.getContractInstance()
		return readContract({
			contract,
			method,
			params
		}) as Promise<T>
	}

	protected async write(method: string, params: unknown[] = []) {
		if (!this.account) {
			throw new Error('Wallet not connected')
		}

		const contract = this.getContractInstance()

		const tx = prepareContractCall({
			contract,
			method,
			params
		})

		const { transactionHash } = await sendTransaction({
			account: this.account,
			transaction: tx
		})

		await waitForReceipt({
			client: this.client,
			chain: this.chain,
			transactionHash
		})

		return transactionHash
	}

	// =========================
	//         PRIVATE
	// =========================

	private getContractInstance() {
		return getContract({
			client: this.client,
			chain: this.chain,
			address: this.address,
			abi: this.abi
		})
	}
}
