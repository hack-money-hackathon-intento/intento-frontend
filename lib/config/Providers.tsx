'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JSX, useState } from 'react'
import { ThirdwebProvider } from 'thirdweb/react'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig } from './wagmi.config'
import { WalletProvider } from '../providers/WalletProvider'
import { TradingProvider } from '../providers/TradingProvider'

type Props = {
	children: React.ReactNode
}

export function Providers({ children }: Props): JSX.Element {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<QueryClientProvider client={queryClient}>
			<WagmiProvider config={wagmiConfig}>
				<WalletProvider>
					<TradingProvider>
						<ThirdwebProvider>{children}</ThirdwebProvider>
					</TradingProvider>
				</WalletProvider>
			</WagmiProvider>
		</QueryClientProvider>
	)
}
