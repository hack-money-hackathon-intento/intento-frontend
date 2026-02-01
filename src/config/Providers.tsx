'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { JSX, useState } from 'react'
import { ThirdwebProvider } from 'thirdweb/react'

type Props = {
	children: React.ReactNode
}

export function Providers({ children }: Props): JSX.Element {
	const [queryClient] = useState(() => new QueryClient())

	return (
		<QueryClientProvider client={queryClient}>
			<ThirdwebProvider>{children}</ThirdwebProvider>
		</QueryClientProvider>
	)
}
