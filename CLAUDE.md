# CLAUDE.md - Contexto del Proyecto Intento

## Proyecto
Intento - Agregador de prediction markets cross-chain para HackMoney 2026.
El usuario selecciona tokens de múltiples chains, el sistema hace swap a USDC via LiFi, bridge a Polygon, y crea posición en Polymarket.

## Stack
- Next.js 16 + React 19 + Tailwind CSS (NO hay tailwind.config - usa CSS-only con @import "tw-animate-css")
- Thirdweb SDK (wallet connection, EIP-1193 provider)
- Viem (contract interactions)
- LiFi REST API (swaps/bridges) - servicio custom en src/services/rest/li-fi/
- FastAPI backend en localhost:8000 (Polymarket data)
- Framer Motion (animations)

## Estructura Clave
```
src/
├── app/
│   ├── page.tsx          ← Componente principal. Contiene onRegister y flow de consent
│   ├── globals.css       ← Estilos globales, 496 líneas
│   └── api/tx/route.ts   ← PROBLEMA: firma txs con WALLET_DEPLOYER_PRIVATE_KEY
├── components/
│   ├── landing/           ← hero-section, header
│   ├── dashboard/         ← markets.tsx (Polymarket integration)
│   ├── registration/      ← consent-screen.tsx, registration-screen.tsx, token-selector.tsx
│   ├── animations/        ← SplitFlapDisplay.tsx
│   └── ui/
├── lib/
│   ├── hooks/
│   │   └── approve/       ← useConsentSignature.ts (EIP-1193 signing)
│   ├── providers/         ← WalletProvider.tsx, TradingProvider.tsx (Polymarket CLOB)
│   ├── config/            ← wagmi.config.ts, Providers.tsx
│   ├── services/          ← polymarket.ts
│   └── models/            ← approve.model.ts
├── services/
│   └── rest/li-fi/        ← Servicio REST para LiFi quotes
└── helpers/               ← wallet-provider.helper.ts (EIP-1193 utilities)
```

## Flujo de Usuario ACTUALIZADO
1. **Landing Page** → Usuario ve Hero + How It Works
2. **Connect Wallet** → Usuario hace clic en "Connect Wallet" (thirdweb)
3. **Consent Screen** → Firma mensaje de Terms & Conditions (EIP-1193 personal_sign)
   - Se guarda en localStorage como `intento_consent_{address}`
   - Válido por 30 días
4. **Onboarding Modal** (opcional) → Tutorial rápido
5. **Check Registration** → Verifica si usuario está registrado en contratos Intento
6. **Registration Screen** → Usuario selecciona tokens de Polygon, Optimism, Base
   - `onRegister()` ejecuta: approves + register en cada chain
   - Usa EIP-1193 provider correctamente (abre MetaMask)
   - Soporta atomic batch y sequential transactions
7. **Dashboard** → Acceso a mercados de Polymarket

## Tema Visual - Martian Retro-Futurism
- --mars-rust: #C45D3E (primary)
- --space-black: #0A0A0C (background)
- --deep-crater: #1A1A1F (cards)
- --dust-cloud: #F5EDE0 (text)
- --transmission-green: #3BFF8A (YES/success)
- --hal-red: #FF3B3B (NO/error)
- Fonts: Space Grotesk (headers), Darker Grotesque (body)

## Bug Conocido Crítico
onSendUsdBundle NO abre MetaMask. Hace POST a /api/tx donde el backend firma con private key del deployer.
REFERENCIA CORRECTA: onRegister SÍ abre MetaMask usando el patrón EIP-1193 provider → eth_sendTransaction.

## Reglas
- NO instalar @lifi/sdk (mantener REST)
- NO romper onRegister que ya funciona
- NO usar tailwind.config (el proyecto usa CSS-only Tailwind v4)
- Commits pequeños y descriptivos
