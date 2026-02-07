# 🚀 Integración Rápida del Sistema Approve

## Ejemplo 1: Integrar en Registration Flow Existente

Si tienes un componente `RegistrationScreen` existente, reemplázalo así:

### Antes:
```tsx
// app/register/page.tsx
import { RegistrationScreen } from '@/components/registration/registration-screen';

export default function RegisterPage() {
  return <RegistrationScreen />;
}
```

### Ahora:
```tsx
// app/register/page.tsx
import { ApproveScreen } from '@/components/approve';
import { useSelectedTokens } from '@/hooks/useSelectedTokens'; // Tu hook existente

export default function RegisterPage() {
  const selectedTokens = useSelectedTokens(); // O de donde obtengas los tokens

  return (
    <div className="min-h-screen bg-[#0A0A0C]">
      <ApproveScreen
        selectedTokens={selectedTokens.map(token => ({
          chainId: token.chainId,
          tokenAddress: token.address as `0x${string}`,
          tokenSymbol: token.symbol,
          amount: token.amount.toString(),
        }))}
        onComplete={() => {
          // Redirigir a dashboard o siguiente paso
          window.location.href = '/dashboard';
        }}
      />
    </div>
  );
}
```

## Ejemplo 2: Proteger Dashboard con ApproveGuard

```tsx
// app/dashboard/page.tsx
import { ApproveGuard } from '@/components/approve';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function DashboardPage() {
  return (
    <ApproveGuard redirectTo="/approve">
      <Dashboard />
    </ApproveGuard>
  );
}
```

¿Qué hace `ApproveGuard`?
- ✅ Verifica si wallet está conectada
- ✅ Verifica si usuario firmó consent
- ✅ Verifica si usuario aprobó tokens
- ✅ Si falta algo → redirige a `/approve`
- ✅ Si todo OK → renderiza children

## Ejemplo 3: Verificar Estado en Cualquier Componente

```tsx
'use client';

import { useApproveSession } from '@/lib/hooks/approve';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function TradeButton() {
  const router = useRouter();
  const { 
    isApproveComplete, 
    needsConsent,
    session 
  } = useApproveSession();

  if (needsConsent) {
    return (
      <Button 
        onClick={() => router.push('/approve')}
        variant="destructive"
      >
        Sign Terms to Trade
      </Button>
    );
  }

  if (!isApproveComplete) {
    return (
      <Button 
        onClick={() => router.push('/approve')}
        variant="outline"
      >
        Approve Tokens to Trade
      </Button>
    );
  }

  return (
    <Button onClick={handleTrade}>
      Create Trade Position
    </Button>
  );
}
```

## Ejemplo 4: Mostrar Banner de Aprobación Pendiente

```tsx
'use client';

import { useApproveSession } from '@/lib/hooks/approve';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function ApprovalStatusBanner() {
  const router = useRouter();
  const { needsConsent, isApproveComplete } = useApproveSession();

  if (needsConsent) {
    return (
      <Alert 
        className="bg-[#FF3B3B]/10 border-[#FF3B3B]/30 cursor-pointer"
        onClick={() => router.push('/approve')}
      >
        <AlertCircle className="h-4 w-4 text-[#FF3B3B]" />
        <AlertDescription className="text-[#FF3B3B]">
          You need to sign Intento terms before trading. Click here to approve.
        </AlertDescription>
      </Alert>
    );
  }

  if (!isApproveComplete) {
    return (
      <Alert 
        className="bg-[#C45D3E]/10 border-[#C45D3E]/30 cursor-pointer"
        onClick={() => router.push('/approve')}
      >
        <AlertCircle className="h-4 w-4 text-[#C45D3E]" />
        <AlertDescription className="text-[#C45D3E]">
          You need to approve tokens before trading. Click here to continue.
        </AlertDescription>
      </Alert>
    );
  }

  return null; // Todo aprobado, no mostrar nada
}
```

Úsalo en tu layout:
```tsx
// app/layout.tsx
import { ApprovalStatusBanner } from '@/components/approve/ApprovalStatusBanner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ApprovalStatusBanner />
        {children}
      </body>
    </html>
  );
}
```

## Ejemplo 5: Revisar Tokens Aprobados

```tsx
'use client';

import { useTokenApprovals } from '@/lib/hooks/approve';
import { useAccount } from 'wagmi';
import { Badge } from '@/components/ui/badge';

export function ApprovedTokensList() {
  const { address } = useAccount();
  const { getAllApprovals } = useTokenApprovals();

  if (!address) return null;

  const approvals = getAllApprovals(address);

  if (approvals.length === 0) {
    return <p className="text-[#4A4A55]">No tokens approved yet</p>;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-[#F5EDE0] font-semibold">Approved Tokens</h3>
      <div className="flex flex-wrap gap-2">
        {approvals.map((approval, i) => (
          <Badge key={i} className="bg-[#3BFF8A]/20 text-[#3BFF8A]">
            {approval.tokenSymbol} on Chain {approval.chainId}
          </Badge>
        ))}
      </div>
    </div>
  );
}
```

## Ejemplo 6: Revocar Consent (Settings)

```tsx
'use client';

import { useConsentSignature } from '@/lib/hooks/approve';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export function RevokeConsentButton() {
  const { revokeConsent, hasConsent } = useConsentSignature();

  if (!hasConsent) return null;

  function handleRevoke() {
    revokeConsent();
    // Opcional: redirect o reload
    window.location.reload();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          Revoke Consent
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#1A1A1F] border-[#2D2D35]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[#F5EDE0]">
            Revoke Intento Consent?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[#4A4A55]">
            This will remove your consent signature from local storage.
            You will need to sign again to use Intento.
            Your token approvals will remain (they are on-chain).
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-[#2D2D35] text-[#F5EDE0]">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleRevoke}
            className="bg-[#FF3B3B] hover:bg-[#FF3B3B]/80"
          >
            Revoke
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

## Ejemplo 7: Custom Hook para Validar Trading

```tsx
// hooks/useTradingEnabled.ts
import { useApproveSession } from '@/lib/hooks/approve';
import { useAccount } from 'wagmi';

export function useTradingEnabled() {
  const { isConnected, chainId } = useAccount();
  const { isApproveComplete } = useApproveSession();

  const canTrade = isConnected && 
                   isApproveComplete && 
                   chainId === 137; // Polygon

  const reason = !isConnected 
    ? 'Connect wallet first'
    : !isApproveComplete
    ? 'Complete approval first'
    : chainId !== 137
    ? 'Switch to Polygon'
    : null;

  return {
    canTrade,
    reason,
  };
}
```

Úsalo así:
```tsx
import { useTradingEnabled } from '@/hooks/useTradingEnabled';

export function CreatePositionButton() {
  const { canTrade, reason } = useTradingEnabled();

  return (
    <Button disabled={!canTrade} title={reason || undefined}>
      {canTrade ? 'Create Position' : reason}
    </Button>
  );
}
```

## Ejemplo 8: Integrar con Flujo Existente page.tsx

Si tu `app/page.tsx` ya tiene lógica de registration, agrégale el approve:

```tsx
// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { useApproveSession } from '@/lib/hooks/approve';
import { ApproveScreen } from '@/components/approve';
import { Landing } from '@/components/landing';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  const account = useActiveAccount();
  const { isApproveComplete, session } = useApproveSession();
  const [showApprove, setShowApprove] = useState(false);

  useEffect(() => {
    // Si wallet conectada pero no ha aprobado, mostrar approve
    if (account && !isApproveComplete) {
      setShowApprove(true);
    }
  }, [account, isApproveComplete]);

  // No conectado → Landing
  if (!account) {
    return <Landing />;
  }

  // Conectado pero sin aprobar → Approve
  if (showApprove || !isApproveComplete) {
    return (
      <ApproveScreen
        selectedTokens={[
          // Obtén tokens de tu state management
        ]}
        onComplete={() => setShowApprove(false)}
      />
    );
  }

  // Todo OK → Dashboard
  return <Dashboard />;
}
```

## 🎯 Tips de Integración

### 1. Orden de Providers
Asegúrate de que `WagmiProvider` esté arriba en el árbol:

```tsx
// app/layout.tsx
<WagmiProvider config={wagmiConfig}>
  <WalletProvider>
    <TradingProvider>
      <ThirdwebProvider>
        {children}
      </ThirdwebProvider>
    </TradingProvider>
  </WalletProvider>
</WagmiProvider>
```

### 2. Actualizar Contratos
ANTES de usar en producción, actualiza:

```typescript
// lib/config/constants/approve.ts
export const INTENTO_CONTRACTS: Record<number, `0x${string}`> = {
  8453: '0xTU_CONTRATO_BASE' as `0x${string}`,
  10: '0xTU_CONTRATO_OPTIMISM' as `0x${string}`,
  137: '0xTU_CONTRATO_POLYGON' as `0x${string}`,
};
```

### 3. Testing LocalStorage
Durante desarrollo, limpia localStorage frecuentemente:

```javascript
// DevTools Console
localStorage.clear();
// O específicamente:
localStorage.removeItem('approve_consent_0xYourAddress');
localStorage.removeItem('token_approvals_0xYourAddress');
```

### 4. Backend Opcional
Si quieres trackear consents en backend:

```typescript
// app/api/approve/consent/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const consent = await req.json();
  
  // Guardar en tu DB
  await db.consents.create({
    data: consent
  });

  return Response.json({ success: true });
}
```

El hook `useConsentSignature` ya hace el POST automáticamente.

## 📚 Más Info

Lee la documentación completa en:
- `APPROVE_SYSTEM.md` - Guía técnica completa
- `lib/hooks/approve/` - Código de hooks
- `components/approve/` - Código de componentes

¡Listo para integrar! 🚀
