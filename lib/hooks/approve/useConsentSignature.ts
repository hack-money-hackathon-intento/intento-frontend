import { useState } from 'react';
import { useActiveAccount, useActiveWallet } from 'thirdweb/react';
import { ApproveConsent } from '@/lib/models/approve.model';
import { getProviderFromThirdwebWallet } from '@/helpers/wallet-provider.helper';

export function useConsentSignature() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const address = account?.address;

  const [isSigning, setIsSigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const EIP712_MESSAGE = {
    domain: {
      name: 'Intento Protocol',
      version: '1.0',
      chainId: 137, // Polygon como chain principal
    },
    message: {
      title: 'Intento Terms of Service',
      description: 'I agree to move my funds through INTENTO and take positions on Polymarket',
      timestamp: Date.now(),
      wallet: address,
    },
  };

  async function signConsent(): Promise<boolean> {
    if (!address || !wallet) {
      setError('Wallet not connected');
      return false;
    }

    setIsSigning(true);
    setError(null);

    try {
      // Get EIP-1193 provider from thirdweb wallet
      const provider = await getProviderFromThirdwebWallet(wallet);

      // Create message to sign
      const message = JSON.stringify(EIP712_MESSAGE.message);

      // Sign message using personal_sign
      const signature = await provider.request({
        method: 'personal_sign',
        params: [message, address],
      }) as string;

      const consent: ApproveConsent = {
        walletAddress: address,
        signature,
        message,
        timestamp: Date.now(),
        version: '1.0',
      };

      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          `intento_consent_${address.toLowerCase()}`,
          JSON.stringify(consent)
        );
      }

      // Optional: send to backend
      try {
        await fetch('/api/approve/consent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consent),
        });
      } catch (err) {
        console.warn('Failed to save consent to backend:', err);
      }

      setIsSigning(false);
      return true;
    } catch (error: any) {
      console.error('Consent signature failed:', error);
      setError(error?.message || 'Failed to sign consent');
      setIsSigning(false);
      return false;
    }
  }

  function checkConsent(): ApproveConsent | null {
    if (!address || typeof window === 'undefined') return null;

    const stored = localStorage.getItem(`intento_consent_${address.toLowerCase()}`);
    if (!stored) return null;

    try {
      const consent = JSON.parse(stored) as ApproveConsent;

      // Validate not expired (30 days)
      const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
      if (Date.now() - consent.timestamp > THIRTY_DAYS) {
        localStorage.removeItem(`intento_consent_${address.toLowerCase()}`);
        return null;
      }

      return consent;
    } catch {
      return null;
    }
  }

  function revokeConsent() {
    if (!address || typeof window === 'undefined') return;
    localStorage.removeItem(`intento_consent_${address.toLowerCase()}`);
  }

  return {
    signConsent,
    checkConsent,
    revokeConsent,
    hasConsent: !!checkConsent(),
    isSigning,
    error,
  };
}
