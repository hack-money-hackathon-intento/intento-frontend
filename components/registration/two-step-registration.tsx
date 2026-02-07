"use client"

import { useState, useEffect } from "react"
import { Address } from "thirdweb"
import { useActiveAccount, useActiveWallet } from "thirdweb/react"
import { getProviderFromThirdwebWallet } from "@/helpers/wallet-provider.helper"
import { RegisterStepper, RegisterStep } from "./stepper"
import { TokenSelector, TokenSelection } from "./token-selector"
import { Balances } from "@/models/balances"
import Image from "next/image"

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

type TwoStepRegistrationProps = {
  accountAddress: Address
  registerSteps: RegisterStep[]
  selectionByChain: Record<string, any>
  isRegistering: boolean
  balancesWithEnabled: Balances[]
  spenderByChain: Record<number, Address>
  onRegister: () => Promise<void>
  onSetTokens: () => Promise<void>
  onSelectionChange: (selections: Record<string, TokenSelection[]>) => void
}

export function TwoStepRegistration({
  accountAddress,
  registerSteps,
  selectionByChain,
  isRegistering,
  balancesWithEnabled,
  spenderByChain,
  onRegister,
  onSetTokens,
  onSelectionChange
}: TwoStepRegistrationProps) {
  const account = useActiveAccount()
  const wallet = useActiveWallet()

  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [hasSignedTerms, setHasSignedTerms] = useState(false)
  const [isSigning, setIsSigning] = useState(false)
  const [signError, setSignError] = useState<string | null>(null)

  // Check if user already signed terms
  useEffect(() => {
    if (accountAddress && typeof window !== 'undefined') {
      const signed = localStorage.getItem(`intento_terms_${accountAddress.toLowerCase()}`)
      if (signed === 'true') {
        setHasSignedTerms(true)
        setCurrentStep(2)
      }
    }
  }, [accountAddress])

  const handleSignTerms = async () => {
    if (!wallet || !account) {
      setSignError('Wallet not connected')
      return
    }

    setIsSigning(true)
    setSignError(null)

    try {
      const provider = await getProviderFromThirdwebWallet(wallet)

      const message = JSON.stringify({
        title: 'Intento Terms of Service',
        description: 'I agree to use Intento for prediction markets across multiple chains',
        timestamp: Date.now(),
        wallet: accountAddress,
      })

      // Sign with personal_sign - compatible with MetaMask and Brave
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, accountAddress],
      }) as string

      console.log('✅ Signature received:', signature)

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`intento_terms_${accountAddress.toLowerCase()}`, 'true')
        localStorage.setItem(`intento_terms_sig_${accountAddress.toLowerCase()}`, signature)
      }

      setHasSignedTerms(true)
      setCurrentStep(2)
      console.log('✅ Terms signed successfully')
    } catch (error: any) {
      console.error('❌ Failed to sign terms:', error)

      // Better error messages
      let errorMessage = 'Failed to sign terms'
      if (error?.code === 4001) {
        errorMessage = 'Signature rejected by user'
      } else if (error?.message) {
        errorMessage = error.message
      }

      setSignError(errorMessage)
    } finally {
      setIsSigning(false)
    }
  }

  const hasSelection = Object.keys(selectionByChain).length > 0

  // Filter only Polygon, Optimism, Base
  const filteredBalances = balancesWithEnabled.filter(
    balance => [137, 10, 8453].includes(balance.chainId)
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.08)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">I</span>
          </div>
          <span className="text-white font-semibold text-lg">Intento</span>
        </div>
      </header>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <div className="w-full max-w-3xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Registration Required
            </h1>
            <p className="text-slate-400 text-lg">
              Complete 2 steps to start trading
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${hasSignedTerms ? 'bg-green-600 text-white' : currentStep === 1 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400'}
              `}>
                {hasSignedTerms ? '✓' : '1'}
              </div>
              <span className={`ml-2 font-medium ${hasSignedTerms || currentStep === 1 ? 'text-white' : 'text-slate-500'}`}>
                Sign Terms
              </span>
            </div>

            {/* Connector */}
            <div className={`w-16 h-1 mx-4 ${hasSignedTerms ? 'bg-green-600' : 'bg-slate-700'}`} />

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${currentStep === 2 ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-400'}
              `}>
                2
              </div>
              <span className={`ml-2 font-medium ${currentStep === 2 ? 'text-white' : 'text-slate-500'}`}>
                Approve Tokens
              </span>
            </div>
          </div>

          {/* Registration Card */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">

            {/* STEP 1: Sign Terms */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                    1
                  </div>
                  <div>
                    <p className="text-white font-semibold">Terms & Conditions</p>
                    <p className="text-slate-400 text-sm">Step 1 of 2</p>
                  </div>
                </div>

                {/* Terms content */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 max-h-96 overflow-y-auto">
                  <h3 className="text-white font-semibold mb-4">Intento Terms of Service</h3>
                  <div className="text-slate-300 text-sm space-y-4">
                    <p>By using Intento, you agree to:</p>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Take full responsibility for your wallet security and private keys</li>
                      <li>Understand that prediction markets involve financial risk</li>
                      <li>Acknowledge that Intento is an aggregator and does not hold your funds</li>
                      <li>Accept that blockchain transactions are irreversible</li>
                      <li>Comply with your local regulations regarding prediction markets</li>
                      <li>Understand gas fees apply for blockchain transactions</li>
                    </ul>

                    <h4 className="text-white font-semibold mt-6 mb-2">Risk Disclosure</h4>
                    <p>
                      Cryptocurrency and prediction markets are highly volatile. You may lose all invested funds.
                      This is not financial advice.
                    </p>
                  </div>
                </div>

                {signError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <p className="text-red-400 text-sm">{signError}</p>
                  </div>
                )}

                <button
                  onClick={handleSignTerms}
                  disabled={isSigning}
                  className={`
                    w-full px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200
                    flex items-center justify-center gap-2
                    ${isSigning
                      ? 'bg-slate-700 cursor-not-allowed'
                      : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-500/25'
                    }
                  `}
                >
                  {isSigning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Sign with Wallet
                    </>
                  )}
                </button>

                <div className="flex items-start gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4">
                  <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No gas fees required for signing. Your wallet will prompt you to sign a message.</span>
                </div>
              </div>
            )}

            {/* STEP 2: Approve Tokens */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold">
                    2
                  </div>
                  <div>
                    <p className="text-white font-semibold">Approve Tokens</p>
                    <p className="text-slate-400 text-sm">Step 2 of 2 • Select tokens from Polygon, Optimism, and Base</p>
                  </div>
                </div>

                {/* Token Selector con logos */}
                <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-white font-semibold">Select Tokens</h3>
                    <div className="flex items-center gap-2">
                      {/* Chain logos */}
                      <Image
                        src="/blockchains/137.svg"
                        alt="Polygon"
                        width={20}
                        height={20}
                        className="opacity-60"
                      />
                      <Image
                        src="/blockchains/10.svg"
                        alt="Optimism"
                        width={20}
                        height={20}
                        className="opacity-60"
                      />
                      <Image
                        src="/blockchains/8453.svg"
                        alt="Base"
                        width={20}
                        height={20}
                        className="opacity-60"
                      />
                    </div>
                  </div>
                  <TokenSelector
                    balances={filteredBalances}
                    spenderByChain={spenderByChain}
                    onSelectionChange={onSelectionChange}
                  />
                </div>

                {/* Stepper - Only show if there's selection and registering */}
                {hasSelection && registerSteps.length > 0 && isRegistering && (
                  <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                    <h3 className="text-white font-semibold mb-4">Registration Progress</h3>
                    <RegisterStepper steps={registerSteps} />
                  </div>
                )}

                {/* Action Buttons */}
                {hasSelection ? (
                  <div className="flex gap-3">
                    <button
                      onClick={onRegister}
                      disabled={isRegistering}
                      className={`
                        flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200
                        flex items-center justify-center gap-2
                        ${isRegistering
                          ? 'bg-slate-700 cursor-not-allowed'
                          : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-500/25'
                        }
                      `}
                    >
                      {isRegistering ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Register Now
                        </>
                      )}
                    </button>

                    <button
                      onClick={onSetTokens}
                      disabled={isRegistering}
                      className={`
                        flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200
                        flex items-center justify-center gap-2
                        ${isRegistering
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'
                        }
                      `}
                    >
                      {isRegistering ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Update Tokens
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-slate-400 text-sm">
                      Select at least one token to enable registration
                    </p>
                  </div>
                )}

                {/* Back button */}
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-slate-400 text-sm hover:text-white transition-colors flex items-center gap-2 justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Terms
                </button>

                <div className="flex items-start gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4">
                  <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>
                    Your funds remain in your wallet. Registration only enables tokens for trading on Intento markets.
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 border-t border-slate-800/50">
        <p className="text-slate-600 text-sm">
          Built for the multi-chain future
        </p>
      </footer>
    </main>
  )
}
