export interface ApproveConsent {
  walletAddress: string;
  signature: string;
  message: string;
  timestamp: number;
  version: string; // "1.0"
}

export interface TokenApproval {
  chainId: number;
  tokenAddress: string;
  tokenSymbol: string;
  spenderAddress: string; // Contrato Intento en esa chain
  approved: boolean;
  txHash?: string;
  timestamp?: number;
}

export interface ApproveSession {
  walletAddress: string;
  consentCompleted: boolean;
  approvalsCompleted: boolean;
  consent?: ApproveConsent;
  tokenApprovals: TokenApproval[];
  lastUpdated: number;
}

export enum ApproveStep {
  CONSENT = 'consent',
  TOKEN_APPROVALS = 'token_approvals',
  COMPLETE = 'complete'
}
