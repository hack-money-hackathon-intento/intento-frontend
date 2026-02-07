"use client"

import { useMemo } from "react"
import { Address } from "thirdweb"
import { RegisterStepper, RegisterStep } from "./stepper"
import { TokenSelector, TokenSelection } from "./token-selector"
import { Balances } from "@/models/balances"

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

type RegistrationScreenProps = {
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

export function RegistrationScreen({
  registerSteps,
  selectionByChain,
  isRegistering,
  balancesWithEnabled,
  spenderByChain,
  onRegister,
  onSetTokens,
  onSelectionChange
}: RegistrationScreenProps) {
  const hasSelection = useMemo(
    () => Object.keys(selectionByChain).length > 0,
    [selectionByChain]
  )

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950">
      {/* Deep dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" />

      {/* Subtle radial glow from center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.08)_0%,_transparent_70%)]" />

      {/* Very subtle noise texture */}
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
              Select tokens to enable for prediction markets
            </p>
          </div>

          {/* Registration Card */}
          <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-8 shadow-2xl">
            <div className="flex flex-col gap-6">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-slate-300 text-sm font-medium">
                    Not Registered
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  How to Register
                </h3>
                <ul className="text-slate-400 text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Select tokens from your wallet to enable for trading</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>The registration will approve and enable selected tokens</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>Transactions will be processed across chains automatically</span>
                  </li>
                </ul>
              </div>

              {/* Token Selector */}
              <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                <TokenSelector
                  balances={balancesWithEnabled}
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
                    className={[
                      'flex-1 px-6 py-4 rounded-xl font-semibold text-white transition-all duration-200',
                      'flex items-center justify-center gap-2',
                      isRegistering
                        ? 'bg-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 shadow-lg shadow-orange-500/25'
                    ].join(' ')}
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
                    className={[
                      'flex-1 px-6 py-4 rounded-xl font-semibold transition-all duration-200',
                      'flex items-center justify-center gap-2',
                      isRegistering
                        ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-600'
                    ].join(' ')}
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

              {/* Info footer */}
              <div className="flex items-start gap-2 text-xs text-slate-500 border-t border-slate-800 pt-4">
                <svg className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>
                  Your funds remain in your wallet. Registration only enables tokens for trading on Intento markets.
                </span>
              </div>
            </div>
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
