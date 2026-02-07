"use client"

import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Address, ZERO_ADDRESS } from "thirdweb"
import { useActiveAccount, useActiveWallet } from "thirdweb/react"
import { getAddress, zeroAddress, encodeFunctionData } from "viem"
import type { Hex } from "viem"

import { Header } from "@/components/landing/header"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { OnboardingModal } from "@/components/landing/onboarding-modal"
import { Dashboard } from "@/components/dashboard/dashboard"
import { RegistrationScreen } from "@/components/registration/registration-screen"
import { RegisterStep } from "@/components/registration/stepper"

import { useCombinatorIntento } from "@/hooks/combinator-intento"
import { useLiFi } from "@/hooks/li-fi"
import { intentoAbi } from "@/assets/json/abis"
import { buildApproveCalls } from "@/helpers/build-approve-call.helper"
import { toBigIntSafe } from "@/helpers/to-bigint-safe.helper"
import {
  getProviderFromThirdwebWallet,
  ensureChain,
  supportsAtomicBatch,
  sendAtomicBatch,
  pollBatchStatus,
  sendSequential,
  type BatchCall
} from "@/helpers/wallet-provider.helper"
import { INTENTO_CONTRACTS } from "@/config/constants"
import { TokenSelection } from "@/components/registration/token-selector"

type Eip1193Provider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

type StepStatus = 'idle' | 'loading' | 'done' | 'error'

export default function Home() {
  // thirdweb
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const accountAddress = useMemo(() => {
    try {
      return getAddress(account?.address as Address)
    } catch {
      return ZERO_ADDRESS
    }
  }, [account])

  // states
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [userHasClickedConnect, setUserHasClickedConnect] = useState(false)
  const [registerStatusByChain, setRegisterStatusByChain] = useState<Record<number, StepStatus>>({})
  const [isRegistering, setIsRegistering] = useState(false)
  const [expandedChains, setExpandedChains] = useState<Set<number>>(new Set())
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set())
  const [selectionByChain, setSelectionByChain] = useState<
    Record<
      string,
      {
        spender: Address
        addresses: string[]
        enable: boolean[]
        balances: bigint[]
        allowances: bigint[]
      }
    >
  >({})

  const timeoutsRef = useRef<number[]>([])

  // hooks
  const { useBalances } = useLiFi()
  const { data: dataBalances } = useBalances()

  const balances = useMemo(() => dataBalances ?? [], [dataBalances])

  const {
    useBalancesWithEnabled,
    useIsRegistered,
    useIsRegisteredByChain,
  } = useCombinatorIntento()

  // is registered (any chain)
  const { data: dataIsRegistered, isLoading: isLoadingIsRegistered } = useIsRegistered()

  const isRegistered = useMemo(
    () => dataIsRegistered ?? false,
    [dataIsRegistered]
  )

  // is registered by chain
  const { data: dataIsRegisteredByChain } = useIsRegisteredByChain()

  const isRegisteredByChain = useMemo(
    () => dataIsRegisteredByChain ?? {},
    [dataIsRegisteredByChain]
  )

  // balances with enabled
  const { data: dataBalancesWithEnabled } = useBalancesWithEnabled(balances)

  const balancesWithEnabled = useMemo(() => {
    const list = dataBalancesWithEnabled ?? []

    return list
      .map(balance => ({
        ...balance,
        tokens: [...balance.tokens]
          .filter(token => token.address !== ZERO_ADDRESS)
          .sort((a, b) => {
            const valueA = (Number(a.amount) * Number(a.priceUSD || 0)) / 10 ** a.decimals
            const valueB = (Number(b.amount) * Number(b.priceUSD || 0)) / 10 ** b.decimals
            return valueB - valueA
          })
      }))
      .sort((a, b) => {
        const totalA = a.tokens.reduce(
          (acc, token) =>
            acc +
            (Number(token.amount) * Number(token.priceUSD || 0)) / 10 ** token.decimals,
          0
        )
        const totalB = b.tokens.reduce(
          (acc, token) =>
            acc +
            (Number(token.amount) * Number(token.priceUSD || 0)) / 10 ** token.decimals,
          0
        )
        return totalB - totalA
      })
  }, [dataBalancesWithEnabled])

  // variables
  const chainOrder = useMemo(() => [10, 137, 8453], [])

  // spender addresses by chain (Intento contract addresses)
  const spenderByChain = useMemo(() => {
    const mapping: Record<number, Address> = {}
    INTENTO_CONTRACTS.forEach(contract => {
      mapping[contract.chainId] = contract.contractAddress
    })
    return mapping
  }, [])

  // effects
  useEffect(() => {
    if (balancesWithEnabled.length === 0) return

    const enabledTokens = new Set<string>()
    balancesWithEnabled.forEach(balance => {
      balance.tokens.forEach(token => {
        if (token.enabled) {
          enabledTokens.add(`${balance.chainId}-${token.address.toLowerCase()}`)
        }
      })
    })

    setSelectedTokens(prev => (prev.size > 0 ? prev : enabledTokens))
  }, [balancesWithEnabled])

  // Client-side mount detection (prevents hydration mismatch)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Check if user has completed onboarding before (from sessionStorage)
  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const hasCompletedOnboarding = sessionStorage.getItem('intento_onboarding_complete') === 'true'
      setOnboardingComplete(hasCompletedOnboarding)

      // DO NOT read 'intento_user_clicked_connect' from sessionStorage
      // This flag should only be set when user EXPLICITLY clicks Connect in THIS session
      // Reading it from storage causes auto-redirect on page refresh
    }
  }, [isMounted])

  // Auto-show onboarding when wallet connects ONLY if user clicked connect
  useEffect(() => {
    if (account && userHasClickedConnect && !onboardingComplete && !showOnboarding) {
      setShowOnboarding(true)
    }
  }, [account, userHasClickedConnect, onboardingComplete, showOnboarding])

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(t => clearTimeout(t))
      timeoutsRef.current = []
    }
  }, [])

  // functions
  const handleConnectClick = () => {
    // Mark that user intentionally clicked connect (prevents auto-connect bypass)
    // This flag is ONLY valid for current session, NOT persisted across page refreshes
    setUserHasClickedConnect(true)
  }

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    setOnboardingComplete(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('intento_onboarding_complete', 'true')
    }
  }

  const handleSkipOnboarding = () => {
    setShowOnboarding(false)
    setOnboardingComplete(true)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('intento_onboarding_complete', 'true')
    }
  }

  const getChainName = (chainId: number) => {
    switch (chainId) {
      case 10:
        return 'Optimism'
      case 137:
        return 'Polygon'
      case 8453:
        return 'Base'
      default:
        return 'Chain not supported'
    }
  }

  const registerSteps: RegisterStep[] = useMemo(() => {
    const selectedChainIds = Object.keys(selectionByChain)
      .map(Number)
      .sort((a, b) => chainOrder.indexOf(a) - chainOrder.indexOf(b))

    return selectedChainIds.map(chainId => ({
      id: chainId,
      label: getChainName(chainId),
      logoSrc: `/blockchains/${chainId}.svg`,
      status: registerStatusByChain[chainId] ?? 'idle'
    }))
  }, [selectionByChain, registerStatusByChain, chainOrder])

  // Handle selection changes from TokenSelector
  const handleSelectionChange = useCallback((selections: Record<string, TokenSelection[]>) => {
    // Convert TokenSelection[] to selectionByChain format
    const newSelectionByChain: Record<
      string,
      {
        spender: Address
        addresses: string[]
        enable: boolean[]
        balances: bigint[]
        allowances: bigint[]
      }
    > = {}

    Object.entries(selections).forEach(([chainKey, tokens]) => {
      const chainId = Number(chainKey)
      const spender = spenderByChain[chainId]

      if (!spender) return

      const addresses: string[] = []
      const enable: boolean[] = []
      const balances: bigint[] = []
      const allowances: bigint[] = []

      tokens.forEach(token => {
        if (token.enabled) {
          addresses.push(token.tokenAddress.toLowerCase())
          enable.push(true)
          balances.push(token.balance)
          allowances.push(token.allowance)
        }
      })

      if (addresses.length > 0) {
        newSelectionByChain[chainKey] = {
          spender,
          addresses,
          enable,
          balances,
          allowances
        }
      }
    })

    setSelectionByChain(newSelectionByChain)
  }, [spenderByChain])

  const onRegister = async () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []

    const chainIds = Object.keys(selectionByChain)
      .map(Number)
      .sort((a, b) => [10, 137, 8453].indexOf(a) - [10, 137, 8453].indexOf(b))

    if (chainIds.length === 0) return
    if (!wallet || !accountAddress || accountAddress === ZERO_ADDRESS) return

    setIsRegistering(true)

    // init statuses
    setRegisterStatusByChain(() => {
      const base: Record<number, StepStatus> = {}
      chainIds.forEach(id => (base[id] = 'idle'))
      return base
    })

    const provider = await getProviderFromThirdwebWallet(wallet)
    const approveCallsByChain = buildApproveCalls(selectionByChain)

    try {
      for (const chainId of chainIds) {
        const chainKey = String(chainId)
        const entry = selectionByChain[chainKey]
        if (!entry) continue

        setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'loading' }))

        // 1) asegurar red activa en MetaMask (obligatorio)
        await ensureChain(provider, chainId)

        const approveCalls = approveCallsByChain[chainKey] ?? []
        const hasEnableTrue = entry.enable.some(Boolean)

        // --- build register args (tokens, amounts, enableds) ---
        let registerAddresses: Address[] = []
        let registerAmounts: bigint[] = []
        let registerEnable: boolean[] = []

        if (approveCalls.length === 0 && !hasEnableTrue) {
          for (let i = 0; i < entry.addresses.length; i++) {
            if (entry.enable[i] === false) {
              try {
                registerAddresses.push(getAddress(entry.addresses[i]) as Address)
                registerAmounts.push(BigInt(0)) // disabled = 0 amount
                registerEnable.push(false)
              } catch {}
            }
          }
          if (registerAddresses.length === 0) {
            registerAddresses = [zeroAddress]
            registerAmounts = [BigInt(0)]
            registerEnable = [false]
          }
        } else {
          for (let i = 0; i < entry.addresses.length; i++) {
            try {
              const addr = getAddress(entry.addresses[i]) as Address
              registerAddresses.push(addr)
              // Si está enabled, pasar el balance; si no, 0
              registerAmounts.push(entry.enable[i] ? entry.balances[i] : BigInt(0))
              registerEnable.push(entry.enable[i])
            } catch {
              // skip invalid address
            }
          }
        }

        // --- build register call ---
        const intentoAddress = entry.spender
        const registerCall: BatchCall = {
          to: intentoAddress,
          data: encodeFunctionData({
            abi: intentoAbi,
            functionName: 'register',
            args: [registerAddresses]
          })
        }

        // combina approves + register
        const calls: BatchCall[] = [...approveCalls, registerCall]

        // 2) enviar: atomic vs sequential
        const canAtomic = await supportsAtomicBatch(
          provider,
          accountAddress as Address,
          chainId
        )

        if (canAtomic) {
          const { id: batchId } = await sendAtomicBatch(
            provider,
            accountAddress as Address,
            chainId,
            calls
          )

          await pollBatchStatus(provider, batchId)
        } else {
          await sendSequential(provider, accountAddress as Address, calls)
        }

        setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'done' }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsRegistering(false)
    }
  }

  const onSetTokens = async () => {
    timeoutsRef.current.forEach(t => clearTimeout(t))
    timeoutsRef.current = []

    const chainIds = Object.keys(selectionByChain)
      .map(Number)
      .sort((a, b) => [10, 137, 8453].indexOf(a) - [10, 137, 8453].indexOf(b))

    if (chainIds.length === 0) return
    if (!wallet || !accountAddress || accountAddress === ZERO_ADDRESS) return

    setIsRegistering(true)

    // init statuses
    setRegisterStatusByChain(() => {
      const base: Record<number, StepStatus> = {}
      chainIds.forEach(id => (base[id] = 'idle'))
      return base
    })

    const provider = await getProviderFromThirdwebWallet(wallet)
    const approveCallsByChain = buildApproveCalls(selectionByChain)

    try {
      for (const chainId of chainIds) {
        const chainKey = String(chainId)
        const entry = selectionByChain[chainKey]
        if (!entry) continue

        setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'loading' }))

        // 1) asegurar red activa en MetaMask (obligatorio)
        await ensureChain(provider, chainId)

        const approveCalls = approveCallsByChain[chainKey] ?? []

        // --- build setTokens args ---
        const tokenAddresses: Address[] = []
        const tokenEnableds: boolean[] = []

        for (let i = 0; i < entry.addresses.length; i++) {
          try {
            const addr = getAddress(entry.addresses[i]) as Address
            tokenAddresses.push(addr)
            tokenEnableds.push(entry.enable[i])
          } catch {
            // skip invalid address
          }
        }

        // --- build setTokens call ---
        const intentoAddress = entry.spender
        const setTokensCall: BatchCall = {
          to: intentoAddress,
          data: encodeFunctionData({
            abi: intentoAbi,
            functionName: 'setTokens',
            args: [tokenAddresses, tokenEnableds]
          })
        }

        // combina approves + setTokens
        const calls: BatchCall[] = [...approveCalls, setTokensCall]

        // 2) enviar: atomic vs sequential
        const canAtomic = await supportsAtomicBatch(
          provider,
          accountAddress as Address,
          chainId
        )

        if (canAtomic) {
          const { id: batchId } = await sendAtomicBatch(
            provider,
            accountAddress as Address,
            chainId,
            calls
          )

          await pollBatchStatus(provider, batchId)
        } else {
          await sendSequential(provider, accountAddress as Address, calls)
        }

        setRegisterStatusByChain(prev => ({ ...prev, [chainId]: 'done' }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsRegistering(false)
    }
  }

  // Render logic
  // Show landing page until user INTENTIONALLY connects wallet (prevents auto-connect bypass)
  if (!isMounted || !userHasClickedConnect || !account) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#0A0A0C]">
        {/* Deep dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0C] via-slate-900/50 to-[#0A0A0C]" />

        {/* Subtle radial glow from center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(196,93,62,0.08)_0%,_transparent_70%)]" />

        {/* Very subtle noise texture */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }} />

        {/* Header with Nav + ConnectButton */}
        <Header onConnectClick={handleConnectClick} />

        {/* Main content */}
        <div className="relative z-10">
          <HeroSection />
          <HowItWorks />
        </div>

        {/* Footer */}
        <footer className="relative z-10 text-center py-6 border-t border-[#2D2D35]/50">
          <p className="text-[#4A4A55] text-sm">
            Built for the multi-chain future
          </p>
        </footer>

        {/* Onboarding Modal */}
        {showOnboarding && (
          <OnboardingModal
            onComplete={handleOnboardingComplete}
            onSkip={handleSkipOnboarding}
          />
        )}
      </main>
    )
  }

  // User is connected - check registration status
  if (isLoadingIsRegistered) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-slate-400">Checking registration status...</p>
        </div>
      </div>
    )
  }

  // User is not registered - show registration screen
  if (!isRegistered) {
    return (
      <RegistrationScreen
        accountAddress={accountAddress}
        registerSteps={registerSteps}
        selectionByChain={selectionByChain}
        isRegistering={isRegistering}
        balancesWithEnabled={balancesWithEnabled}
        spenderByChain={spenderByChain}
        onRegister={onRegister}
        onSetTokens={onSetTokens}
        onSelectionChange={handleSelectionChange}
      />
    )
  }

  // User is registered - show dashboard
  return <Dashboard />
}
