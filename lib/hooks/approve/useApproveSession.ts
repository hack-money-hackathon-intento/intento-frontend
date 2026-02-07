import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useConsentSignature } from './useConsentSignature';
import { useTokenApprovals } from './useTokenApprovals';
import { ApproveSession, ApproveStep } from '@/lib/models/approve.model';

export function useApproveSession() {
  const { address, isConnected } = useAccount();
  const { signConsent, checkConsent, hasConsent } = useConsentSignature();
  const { getAllApprovals, checkTokenApproval } = useTokenApprovals();

  const [currentStep, setCurrentStep] = useState<ApproveStep>(
    ApproveStep.CONSENT
  );
  const [session, setSession] = useState<ApproveSession | null>(null);

  useEffect(() => {
    if (!address || !isConnected) {
      setSession(null);
      setCurrentStep(ApproveStep.CONSENT);
      return;
    }

    loadSession();
  }, [address, isConnected]);

  function loadSession() {
    if (!address) return;

    const consent = checkConsent();
    const approvals = getAllApprovals(address);

    const newSession: ApproveSession = {
      walletAddress: address,
      consentCompleted: !!consent,
      approvalsCompleted: false, // Se determina según tokens seleccionados
      consent: consent || undefined,
      tokenApprovals: approvals,
      lastUpdated: Date.now(),
    };

    setSession(newSession);

    // Determinar step actual
    if (!newSession.consentCompleted) {
      setCurrentStep(ApproveStep.CONSENT);
    } else if (!newSession.approvalsCompleted) {
      setCurrentStep(ApproveStep.TOKEN_APPROVALS);
    } else {
      setCurrentStep(ApproveStep.COMPLETE);
    }
  }

  async function completeConsentStep() {
    try {
      const consent = await signConsent();
      loadSession(); // Reload
      setCurrentStep(ApproveStep.TOKEN_APPROVALS);
      return consent;
    } catch (error) {
      throw error;
    }
  }

  function checkTokensApprovalStatus(
    selectedTokens: Array<{ chainId: number; tokenAddress: string }>
  ): boolean {
    if (!address) return false;

    return selectedTokens.every((token) =>
      checkTokenApproval(address, token.chainId, token.tokenAddress)
    );
  }

  function completeApprovalsStep() {
    if (!session) return;

    const updatedSession: ApproveSession = {
      ...session,
      approvalsCompleted: true,
      lastUpdated: Date.now(),
    };

    setSession(updatedSession);
    setCurrentStep(ApproveStep.COMPLETE);

    // Guardar en localStorage
    if (typeof window !== 'undefined' && address) {
      localStorage.setItem(
        `approve_session_${address}`,
        JSON.stringify(updatedSession)
      );
    }
  }

  function resetSession() {
    if (!address || typeof window === 'undefined') return;

    localStorage.removeItem(`approve_consent_${address}`);
    localStorage.removeItem(`token_approvals_${address}`);
    localStorage.removeItem(`approve_session_${address}`);

    setSession(null);
    setCurrentStep(ApproveStep.CONSENT);
  }

  return {
    session,
    currentStep,
    isApproveComplete: currentStep === ApproveStep.COMPLETE,
    needsConsent: !hasConsent,
    completeConsentStep,
    checkTokensApprovalStatus,
    completeApprovalsStep,
    resetSession,
    loadSession,
  };
}
