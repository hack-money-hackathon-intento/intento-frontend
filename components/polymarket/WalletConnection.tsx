import React from 'react'
import { useConnect, useDisconnect, useConnection } from 'wagmi'

export function WalletConnection() {
  const { connectors, connect, status, error } = useConnect()
  const { disconnect } = useDisconnect()
  const { address, isConnected } = useConnection()

  if (isConnected) {
    return (
      <div>
        <p>Conectado a: {address}</p>
        <button onClick={() => disconnect()}>
          Desconectar
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2>Conectar Wallet</h2>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          disabled={status === 'pending'}
          style={{ margin: '5px', padding: '10px' }}
        >
          {connector.name}
        </button>
      ))}
      {error && <div>Error: {error.message}</div>}
    </div>
  )
}
