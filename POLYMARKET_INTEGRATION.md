# Polymarket Integration with Safe Wallets

Integration completa de Polymarket con Safe wallets siguiendo el patrón oficial de `wagmi-safe-builder-example`.

## 📦 Dependencias Instaladas

```bash
npm install wagmi @wagmi/core @wagmi/connectors @polymarket/clob-client @polymarket/order-utils ethers@5.7.2 --legacy-peer-deps
```

## 🏗️ Arquitectura

```
Providers.tsx
├── QueryClientProvider (React Query)
├── WagmiProvider (wagmi v3)
│   ├── WalletProvider (ethers signer converter)
│   │   └── TradingProvider (Polymarket CLOB)
│   │       └── ThirdwebProvider (mantiene compatibilidad)
│   │           └── App
```

## 📁 Archivos Creados

### Configuración
- ✅ `lib/config/wagmi.config.ts` - Configuración de wagmi con connectors
- ✅ `lib/config/Providers.tsx` - Actualizado con todos los providers

### Providers
- ✅ `lib/providers/WalletProvider.tsx` - Convierte viem client a ethers signer
- ✅ `lib/providers/TradingProvider.tsx` - Gestiona sesión de Polymarket

### Hooks
- ✅ `lib/hooks/usePolymarket.ts` - Hook unificado para wallet + trading

### Componentes
- ✅ `components/polymarket/PolymarketConnect.tsx` - Botón de conexión
- ✅ `components/polymarket/OrderForm.tsx` - Formulario de órdenes
- ✅ `components/polymarket/PolymarketDemo.tsx` - Demo completo

### Configuración
- ✅ `.env.example` - Variables de entorno

## 🚀 Uso Rápido

### 1. Configurar Variables de Entorno

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega:
```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id
NEXT_PUBLIC_POLYMARKET_BUILDER_API_KEY=tu_api_key (opcional)
NEXT_PUBLIC_POLYMARKET_BUILDER_SECRET=tu_secret (opcional)
```

### 2. Usar en tu Aplicación

```tsx
// app/polymarket/page.tsx
import { PolymarketDemo } from '@/components/polymarket/PolymarketDemo'

export default function PolymarketPage() {
  return <PolymarketDemo />
}
```

### 3. Hook usePolymarket

```tsx
'use client'

import { usePolymarket } from '@/lib/hooks/usePolymarket'

export function MyComponent() {
  const {
    // Wallet state
    address,
    isConnected,
    chainId,
    ethersSigner,
    
    // Trading state
    clobClient,
    isTradingInitialized,
    
    // Actions
    initializeTrading,
    createOrder,
    cancelOrder,
    
    // Helpers
    isReady,
    canTrade,
  } = usePolymarket()

  const handleCreateOrder = async () => {
    if (!isReady) {
      alert('Please connect wallet and initialize trading')
      return
    }

    try {
      const orderId = await createOrder({
        tokenId: 'your-token-id',
        price: 0.5,
        size: 10,
        side: 'BUY',
      })
      console.log('Order created:', orderId)
    } catch (error) {
      console.error('Order failed:', error)
    }
  }

  return (
    <div>
      <button onClick={handleCreateOrder} disabled={!isReady}>
        Create Order
      </button>
    </div>
  )
}
```

## 🔧 Configuración de wagmi

El archivo `wagmi.config.ts` está configurado con:

- **Chains**: Polygon (137)
- **Connectors**:
  - `injected()` - MetaMask, etc.
  - `coinbaseWallet()` - Coinbase Smart Wallet
  - `walletConnect()` - WalletConnect modal

Para agregar más chains:

```typescript
import { polygon, optimism, base } from 'wagmi/chains'

export const wagmiConfig = createConfig({
  chains: [polygon, optimism, base],
  // ...
})
```

Para agregar Safe connector:

```typescript
import { safe } from 'wagmi/connectors'

connectors: [
  // ... otros connectors
  safe({
    allowedDomains: [/app.safe.global$/],
    debug: false,
  }),
]
```

## 📡 API de TradingProvider

### initializeTrading()
```typescript
await initializeTrading()
```
Inicializa el cliente CLOB de Polymarket. Se llama automáticamente al conectar wallet en Polygon.

### createOrder(params)
```typescript
const orderId = await createOrder({
  tokenId: string,      // ID del token de Polymarket
  price: number,        // Precio entre 0 y 1
  size: number,         // Cantidad de shares
  side: 'BUY' | 'SELL', // Lado de la orden
})
```

### cancelOrder(orderId)
```typescript
await cancelOrder('order-id-here')
```

## 🎨 Componentes Listos para Usar

### PolymarketConnect
Botón de conexión con estado de wallet y trading.

```tsx
import { PolymarketConnect } from '@/components/polymarket/PolymarketConnect'

<PolymarketConnect />
```

### OrderForm
Formulario completo para crear órdenes.

```tsx
import { OrderForm } from '@/components/polymarket/OrderForm'

<OrderForm
  tokenId="21742633143463906290569050155826241533067272736897614950488156847949938836455"
  marketName="Will Trump win 2024?"
/>
```

### PolymarketDemo
Demo completo con todos los componentes.

```tsx
import { PolymarketDemo } from '@/components/polymarket/PolymarketDemo'

<PolymarketDemo />
```

## 🔍 Obtener Token IDs

### Método 1: API de Polymarket
```typescript
const response = await fetch('https://gamma-api.polymarket.com/markets?active=true&limit=10')
const markets = await response.json()
console.log(markets[0].clob_token_ids) // Array de token IDs
```

### Método 2: URL de Polymarket
```
https://polymarket.com/event/will-trump-win-2024
                                    ↓
Token IDs están en la metadata del market
```

### Método 3: Explorer
```
https://gamma-api.polymarket.com/events
```

## 🔐 Builder Credentials (Opcional)

Si tienes acceso al programa Builder de Polymarket:

1. Ve a https://polymarket.com/builder
2. Crea una aplicación
3. Copia API Key, Secret, y Address
4. Agrégalos a `.env.local`

**Beneficios**:
- Atribución de volumen de trading
- Acceso a analytics
- Rebates en fees

## 🛠️ Integración con tu Flujo Existente

### Desde Dashboard
```tsx
// components/dashboard/TradeInterface.tsx
import { usePolymarket } from '@/lib/hooks/usePolymarket'

export function TradeInterface({ market }) {
  const { createOrder, isReady } = usePolymarket()
  
  const handleTrade = async () => {
    if (!isReady) {
      // Redirigir a conexión
      return
    }
    
    await createOrder({
      tokenId: market.tokenId,
      price: parseFloat(price),
      size: parseFloat(amount),
      side: side,
    })
  }
}
```

### Desde LiFi Flow
```tsx
// Después de swap + bridge a Polygon
const { createOrder } = usePolymarket()

await createOrder({
  tokenId: selectedMarket.tokenId,
  price: selectedPrice,
  size: usdcAmount / selectedPrice, // Calculate shares
  side: 'BUY',
})
```

## 🎯 Flujo Completo

```
1. Usuario conecta wallet (cualquier chain)
   ↓
2. Usuario selecciona tokens en OP/Base/Polygon
   ↓
3. Usuario hace "Register" (onRegister - ya existe)
   ↓
4. Usuario navega a Markets
   ↓
5. Usuario selecciona mercado de predicción
   ↓
6. Usuario elige YES/NO y cantidad
   ↓
7. Sistema hace:
   - Swap tokens → USDC via LiFi
   - Bridge USDC → Polygon via LiFi
   - usePolymarket().createOrder() ✨
   ↓
8. Usuario recibe shares en Polymarket
```

## ⚠️ Troubleshooting

### Error: "Trading not initialized"
```typescript
const { initializeTrading, isTradingInitialized } = usePolymarket()

if (!isTradingInitialized) {
  await initializeTrading()
}
```

### Error: "Wrong network"
```typescript
import { useSwitchChain } from 'wagmi'

const { switchChain } = useSwitchChain()

if (chainId !== 137) {
  await switchChain({ chainId: 137 })
}
```

### Error: "ethers is not defined"
Asegúrate de que `ethers@5.7.2` esté instalado (no v6):
```bash
npm list ethers
```

### Error: Peer dependency warnings
Usa `--legacy-peer-deps` al instalar:
```bash
npm install --legacy-peer-deps
```

## 🧪 Testing

```bash
npm run dev
```

Navega a la página de demo y verifica:
1. ✅ Wallet se conecta correctamente
2. ✅ Network es Polygon (137)
3. ✅ Trading se inicializa automáticamente
4. ✅ Puedes crear órdenes de prueba

## 📚 Referencias

- [Polymarket CLOB API](https://docs.polymarket.com)
- [wagmi Documentation](https://wagmi.sh)
- [Safe Wallet Integration](https://docs.safe.global)
- [Official wagmi-safe-builder-example](https://github.com/Polymarket/wagmi-safe-builder-example)

## 🎨 Personalización de UI

Todos los componentes usan el tema Martian de tu proyecto:
- `#C45D3E` - Mars rust (primary)
- `#0A0A0C` - Space black (background)
- `#1A1A1F` - Deep crater (cards)
- `#F5EDE0` - Dust cloud (text)
- `#3BFF8A` - Transmission green (success/YES)
- `#FF3B3B` - HAL red (error/NO)

Para personalizar, edita los componentes en `components/polymarket/`.

## 🚀 Próximos Pasos

1. **Agregar Safe Connector**:
   ```bash
   npm install @safe-global/safe-apps-wagmi --legacy-peer-deps
   ```

2. **Integrar con tu flujo existente**:
   - Llamar `createOrder()` después del bridge
   - Mostrar posiciones del usuario
   - Agregar cancelación de órdenes

3. **Mejorar UX**:
   - Loading states durante bridge
   - Toast notifications para órdenes
   - Confirmación de transacciones

4. **Monitoring**:
   - Track orden status
   - Show fill percentage
   - Display realized P&L

¡La integración está lista para usar! 🎉
