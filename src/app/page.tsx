'use client'

import { useEffect, useMemo } from 'react'
import { Address, ZERO_ADDRESS } from 'thirdweb'
import { ConnectButton, useActiveWallet } from 'thirdweb/react'
import { useEnsName } from 'thirdweb/react'
import { getAddress } from 'viem'

import { chains, client } from '@/config/thirdweb.config'
import { useCombinatorIntento } from '@/hooks/combinator-intento'

export default function Home() {
	// thirdweb
	const wallet = useActiveWallet()
	const chainId = useMemo(() => wallet?.getChain()?.id ?? 0, [wallet])
	const account = useMemo(() => wallet?.getAccount(), [wallet])
	const accountAddress = useMemo(() => {
		try {
			return getAddress(account?.address as Address)
		} catch (_error) {
			return ZERO_ADDRESS
		}
	}, [account])

	const { data: ensName } = useEnsName({
		client,
		address: accountAddress
	})

	// intento
	const { useIsRegistered } = useCombinatorIntento()

	const { data: dataIsRegistered, isLoading: isLoadingIsRegistered } =
		useIsRegistered()

	const isRegistered = useMemo(() => {
		return dataIsRegistered ?? false
	}, [dataIsRegistered])

	useEffect(() => {
		if (ensName) {
			console.log('ensName:', ensName)
		}
	}, [ensName])

	return (
		<>
			<div className='min-h-screen w-full flex flex-row justify-center items-center'>
				<ConnectButton
					client={client}
					chains={chains}
					connectButton={{ label: 'Connect Wallet' }}
				/>
			</div>
			{isRegistered ? (
				<div className='min-h-screen w-full flex flex-row justify-center items-center'>
					<p>You are registered</p>
				</div>
			) : (
				<div className='min-h-screen w-full flex flex-row justify-center items-center'>
					<p>You are not registered</p>
				</div>
			)}
		</>
	)
}
