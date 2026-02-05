import { NextRequest, NextResponse } from 'next/server'
import { createWalletClient, Hash, http } from 'viem'
import { Address, privateKeyToAccount } from 'viem/accounts'
import { polygon } from 'viem/chains'

import { intentoAbi } from '@/assets/json/abis'
import { CHAINS } from '@/config/constants/chain'
import { ensureEnvVar } from '@/helpers/ensure-env.helper'
import { routeToBytes } from '@/helpers/route-to-bytes'
import { liFiService } from '@/services/rest/li-fi'

const { getQuote } = liFiService()

export interface Creds {
	key: string
	secret: string
	passphrase: string
}

export interface QuoteArgs {
	fromToken: Address // token to swap from e.g: LAIN (blockchain x) -> USDC (polygon)
	fromAmount: string // amount to swap from e.g: 1_000_000_000_000_000_000 (1 LAIN)
	fromAddress: Address // intento contract (blockchain x)
}

export interface TxRequest {
	creds: Creds
	marketId: string
	outcomeIndex: number
	from: Address
	orderId: string
	quotesArgs: {
		[key: string]: QuoteArgs[]
	}
}

export interface TxRequest {
	creds: Creds
	marketId: string
	outcomeIndex: number
	from: Address
	orderId: string
	quotesArgs: {
		[key: string]: QuoteArgs[]
	}
}

export interface PollingRequest {
	creds: Creds
	marketId: string
	outcomeIndex: number
	from: Address
	orderId: string
	chains: {
		[key: string]: {
			[key: Address]: {
				amount: string
				fromAmountUSD: string
				hash: Hash
			}
		}
	}
}

export async function POST(request: NextRequest) {
	try {
		const { orderId, creds, marketId, outcomeIndex, from, quotesArgs } =
			(await request.json()) as TxRequest

		const hashes = [] as Hash[]
		const lifiScanTxUrLs = [] as string[]

		const pollingRequests = [] as PollingRequest[]
		const pollingRequest: PollingRequest = {
			creds,
			marketId,
			outcomeIndex,
			from,
			orderId,
			chains: {}
		}

		for (const [chainId, quoteArgs] of Object.entries(quotesArgs)) {
			const relayerPrivateKey = ensureEnvVar(
				process.env.WALLET_DEPLOYER_PRIVATE_KEY,
				'WALLET_DEPLOYER_PRIVATE_KEY'
			)

			const account = privateKeyToAccount(`0x${relayerPrivateKey}`)

			const chain = CHAINS[Number(chainId) as keyof typeof CHAINS]

			const wallet = createWalletClient({
				account,
				chain,
				transport: http(chain.rpcUrls.default.http[0])
			})

			for (const quoteArg of quoteArgs) {
				const resultQuote = await getQuote({
					fromChain: Number(chainId),
					toChain: polygon.id,
					fromToken: quoteArg.fromToken,
					toToken: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
					fromAmount: quoteArg.fromAmount,
					fromAddress: quoteArg.fromAddress,
					toAddress: '0x387cF59e511242a4399A1DA62562d3C5dcCa88b6',
					slippage: 0.05,
					order: 'FASTEST'
				})

				if (!resultQuote.success || !resultQuote.data) {
					throw new Error('Failed to get quote')
				}

				const { route, fromAmountUSD } = resultQuote.data

				const tokens = [quoteArg.fromToken]
				const amounts = [BigInt(quoteArg.fromAmount)]
				const routes = [routeToBytes({ fromAmountUSD, route })]

				const tx = await wallet.writeContract({
					address: quoteArg.fromAddress,
					abi: intentoAbi,
					functionName: 'executePayment',
					args: [orderId, from, tokens, amounts, routes],
					gas: BigInt(1200000)
				})

				hashes.push(tx)
				lifiScanTxUrLs.push(`https://scan.li.fi/tx/${tx}`)

				if (!pollingRequest.chains[chainId]) {
					pollingRequest.chains[chainId] = {}
				}

				pollingRequest.chains[chainId][quoteArg.fromToken] = {
					amount: quoteArg.fromAmount,
					fromAmountUSD,
					hash: tx
				}
			}
		}

		pollingRequests.push(pollingRequest)

		console.dir(pollingRequests, { depth: null })
		console.log(JSON.stringify(pollingRequests, null, 2))
		console.log(lifiScanTxUrLs)
		return NextResponse.json({ success: true, data: lifiScanTxUrLs })
	} catch (error) {
		console.error('❌', error)
		return NextResponse.json(
			{ success: false, error: 'Internal server error' },
			{ status: 500 }
		)
	}
}
