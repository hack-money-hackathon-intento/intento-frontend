import React from "react"
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'
import '../styles/neon-cards.css'

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Intento Market | One Intent. Any Chain. Every Market.',
  description: 'An intent-based widget that abstracts cross-chain liquidity fragmentation, enabling users to take positions in prediction markets using any token on any chain.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0A0A0C',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans antialiased bg-void text-dust min-h-screen">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
