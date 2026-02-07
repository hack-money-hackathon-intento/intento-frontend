# 🔧 Actualizar Direcciones de Contratos Intento

## ⚠️ IMPORTANTE: Antes de Usar en Producción

Actualmente, el archivo `lib/config/constants/approve.ts` tiene direcciones de placeholder:

```typescript
export const INTENTO_CONTRACTS: Record<number, `0x${string}`> = {
  8453: '0x0000000000000000000000000000000000000001' as `0x${string}`, // ❌ PLACEHOLDER
  10: '0x0000000000000000000000000000000000000002' as `0x${string}`, // ❌ PLACEHOLDER
  137: '0x0000000000000000000000000000000000000003' as `0x${string}`, // ❌ PLACEHOLDER
};
```

## 📝 Cómo Actualizar

### 1. Obtén las direcciones de tus contratos desplegados

Después de desplegar tus contratos Intento en cada chain, tendrás algo como:

```
Base (8453): 0xABC123...
Optimism (10): 0xDEF456...
Polygon (137): 0xGHI789...
```

### 2. Edita el archivo de constantes

```bash
# Abre el archivo
vim lib/config/constants/approve.ts
# o
code lib/config/constants/approve.ts
```

### 3. Reemplaza con tus direcciones reales

```typescript
export const INTENTO_CONTRACTS: Record<number, `0x${string}`> = {
  8453: '0xTU_DIRECCION_REAL_BASE' as `0x${string}`, // ✅ Base
  10: '0xTU_DIRECCION_REAL_OPTIMISM' as `0x${string}`, // ✅ Optimism
  137: '0xTU_DIRECCION_REAL_POLYGON' as `0x${string}`, // ✅ Polygon
};
```

### 4. Verifica el formato

Asegúrate de que:
- ✅ Empiezan con `0x`
- ✅ Son 42 caracteres (0x + 40 hex chars)
- ✅ Tienen el cast `as \`0x${string}\``
- ✅ Están en minúsculas o checksummed

### 5. Rebuild

```bash
npm run build
```

Si compila sin errores, ¡listo!

## 🧪 Testing con Contratos Reales

### Testnet First
Antes de usar en mainnet, prueba en testnets:

```typescript
// Para testnet
export const INTENTO_CONTRACTS: Record<number, `0x${string}`> = {
  84532: '0xYourBaseSepoliaContract' as `0x${string}`, // Base Sepolia
  11155420: '0xYourOptimismSepoliaContract' as `0x${string}`, // Optimism Sepolia
  80002: '0xYourAmoyContract' as `0x${string}`, // Polygon Amoy
};
```

Actualiza también las chains en wagmi.config.ts si usas testnets.

### Verificar Approvals

Después de hacer approve, verifica on-chain:

```typescript
// Usando viem o ethers
const allowance = await tokenContract.allowance(
  userAddress,
  INTENTO_CONTRACTS[chainId]
);

console.log('Allowance:', allowance.toString());
// Debe ser maxUint256 o un número muy grande
```

## 🔍 Dónde se Usan los Contratos

Los contratos Intento se usan en:

1. **Token Approvals** (`useTokenApprovals.ts`):
   ```typescript
   const intentoContract = INTENTO_CONTRACTS[token.chainId];
   await writeContractAsync({
     address: token.tokenAddress,
     abi: erc20Abi,
     functionName: 'approve',
     args: [intentoContract, maxUint256], // ← Aquí
   });
   ```

2. **Trading Flow** (cuando lo implementes):
   ```typescript
   const intentoAddress = INTENTO_CONTRACTS[chainId];
   // Llamar a funciones del contrato Intento
   ```

## 📋 Checklist de Verificación

Antes de ir a producción:

- [ ] Contratos desplegados en Base, Optimism, Polygon
- [ ] Direcciones actualizadas en `approve.ts`
- [ ] Verificadas en explorers (Etherscan, etc.)
- [ ] Testeadas en testnet primero
- [ ] Rebuild exitoso (`npm run build`)
- [ ] Approve funciona con contratos reales
- [ ] Allowances verificadas on-chain

## 🚨 Troubleshooting

### Error: "Intento contract not found for chain X"
- Verifica que el chainId esté en el objeto INTENTO_CONTRACTS
- Asegúrate de que la wallet esté en la chain correcta

### Error: "Transaction reverted"
- Verifica que el contrato esté deployado en esa chain
- Chequea que la dirección sea correcta
- Verifica que el contrato tenga las funciones esperadas

### Error: "Invalid contract address"
- Formato incorrecto: debe ser `0x` + 40 hex chars
- Usa `as \`0x${string}\`` para el tipo correcto

## 📚 Recursos

- [Viem Contract Interaction](https://viem.sh/docs/contract/writeContract)
- [ERC20 Approve Function](https://eips.ethereum.org/EIPS/eip-20)
- [Etherscan Contract Verification](https://docs.etherscan.io/tutorials/verifying-contracts-programmatically)

## 💡 Tip Pro

Crea un archivo `.env.local` con las direcciones para diferentes ambientes:

```bash
# .env.local
NEXT_PUBLIC_INTENTO_BASE=0xYourBaseContract
NEXT_PUBLIC_INTENTO_OPTIMISM=0xYourOptimismContract
NEXT_PUBLIC_INTENTO_POLYGON=0xYourPolygonContract
```

Luego en `approve.ts`:

```typescript
export const INTENTO_CONTRACTS: Record<number, `0x${string}`> = {
  8453: (process.env.NEXT_PUBLIC_INTENTO_BASE || '0x0000...') as `0x${string}`,
  10: (process.env.NEXT_PUBLIC_INTENTO_OPTIMISM || '0x0000...') as `0x${string}`,
  137: (process.env.NEXT_PUBLIC_INTENTO_POLYGON || '0x0000...') as `0x${string}`,
};
```

Esto facilita cambiar entre testnet/mainnet.

---

**Una vez actualices las direcciones, el sistema de Approve estará completamente funcional y listo para usar en producción! 🚀**
