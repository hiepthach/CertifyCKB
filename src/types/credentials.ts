// W3C Verifiable Credentials Types
export interface Issuer {
  id: string;
  name?: string;
  description?: string;
}

export interface CredentialSubject {
  id?: string;
  type: string;
  name?: string;
  courseName?: string;
  completionDate?: string;
  issuerName?: string;
  issuerDescription?: string;
  grade?: string;
  score?: number;
  skills?: string[];
  metadata?: Record<string, unknown>;
}

export interface CredentialStatus {
  id: string;
  type: string;
  revoked: boolean;
  revocationReason?: string;
  revokedAt?: string;
  revocationListIndex?: string;
  revocationListCredential?: string;
}

export interface CertificateDNA {
  '@context': string[];
  id: string;
  type: string[];
  issuer: Issuer;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  credentialStatus?: CredentialStatus;
}

export interface VerificationResult {
  valid: boolean;
  certificateId: string;
  issuer: { id: string; name: string };
  certificate: {
    isExpired: boolean;
    isRevoked: boolean;
    issuanceDate: string;
    expirationDate?: string;
  };
  errors?: string[];
}

export interface VerificationHistory {
  certificateId: string;
  verifiedAt: string;
  result: VerificationResult;
}

export interface CertificateDisplay {
  title: string;
  recipient: string;
  course: string;
  issuer: string;
  date?: string;
  status: 'active' | 'expired' | 'revoked';
}
