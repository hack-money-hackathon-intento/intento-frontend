"use client"

import { useState } from 'react'
import { useTrading } from '@/lib/providers/TradingProvider'

/**
 * Componente de ejemplo para integración con el backend
 *
 * USO:
 * 1. El usuario hace clic en "Initialize for Backend"
 * 2. El frontend recolecta las firmas del usuario (Safe + Credentials)
 * 3. Los datos se retornan para enviar al backend del colega
 * 4. El backend usa esos datos para ejecutar trades
 */
export function BackendIntegration() {
  const { initializeForBackend, refreshPositions, positions } = useTrading()
  const [isInitializing, setIsInitializing] = useState(false)
  const [backendData, setBackendData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)

    try {
      // 1. Recolectar firmas del usuario (Safe + Credentials)
      const data = await initializeForBackend()
      setBackendData(data)

      // 2. Aquí enviarías los datos al backend del colega
      console.log('📤 Datos para el backend:', data)

      // Ejemplo de cómo enviar al backend:
      /*
      const response = await fetch('/api/backend/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        console.log('✅ Backend initialized successfully')
      }
      */

    } catch (err: any) {
      console.error('❌ Failed to initialize for backend:', err)
      setError(err.message || 'Failed to initialize')
    } finally {
      setIsInitializing(false)
    }
  }

  const handleRefreshPositions = async () => {
    try {
      await refreshPositions()
    } catch (err) {
      console.error('Failed to refresh positions:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Initialize for Backend */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Backend Integration
        </h3>

        <p className="text-slate-400 text-sm mb-4">
          Recolecta las firmas del usuario para que el backend pueda operar
        </p>

        <button
          onClick={handleInitialize}
          disabled={isInitializing}
          className={`
            w-full px-6 py-3 rounded-xl font-semibold text-white transition-all duration-200
            flex items-center justify-center gap-2
            ${isInitializing
              ? 'bg-slate-700 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400'
            }
          `}
        >
          {isInitializing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Initializing (requires signatures)...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Initialize for Backend
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {backendData && (
          <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-400 font-semibold mb-2">✅ Ready for Backend</p>
            <div className="space-y-1 text-xs font-mono text-slate-300">
              <p>Safe Address: <span className="text-green-400">{backendData.safeAddress}</span></p>
              <p>EOA Address: <span className="text-green-400">{backendData.eoaAddress}</span></p>
              <p>Has Credentials: <span className="text-green-400">✅ Yes</span></p>
              <p className="text-slate-500 mt-2">
                Envía este objeto al endpoint de tu colega
              </p>
            </div>
          </div>
        )}
      </div>

      {/* List Positions */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            User Positions
          </h3>

          <button
            onClick={handleRefreshPositions}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {positions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No positions found</p>
            <p className="text-slate-500 text-xs mt-1">
              Initialize for backend first, then refresh positions
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {positions.map((position, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-white font-medium">{position.market || 'Unknown market'}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-slate-400">Side: <span className="text-white">{position.side || 'N/A'}</span></span>
                  <span className="text-slate-400">Size: <span className="text-white">{position.size || 'N/A'}</span></span>
                  {position.pnl && (
                    <span className={`font-semibold ${position.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {position.pnl > 0 ? '+' : ''}{position.pnl}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
