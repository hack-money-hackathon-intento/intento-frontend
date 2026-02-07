import type { NextConfig } from 'next'
import { resolve } from 'path'

const nextConfig: NextConfig = {
	turbopack: {
		root: resolve(__dirname)
	},
	typescript: {
		ignoreBuildErrors: true
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**'
			}
		]
	}
}
export default nextConfig
