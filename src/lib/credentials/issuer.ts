import { ccc } from '@ckb-ccc/core';
import { createSporeCell, getSporeCell } from '@spore-sdk/core';
import type { CertificateDNA, CredentialSubject } from '@/types';
import { encodeCertificateDNA, generateCertificateId, serializeDNA } from './encoder';
import { decodeCertificateDNA } from './decoder';
import { getDefaultClient } from '@/lib/ckb/client';

interface IssueCertificateParams {
  signer: ccc.Signer;
  clusterId: string;
  issuerName: string;
  issuerDescription?: string;
  subject: CredentialSubject;
  expirationDate?: string;
}

interface IssueCertificateResult {
  certificateId: string;
  transactionHash: string;
}

interface GetCertificateResult {
  certificate: CertificateDNA;
  certificateId: string;
  transactionHash?: string;
  clusterId?: string;
}

/**
 * Issue a new certificate as a Spore DOB
 */
export async function issueCertificate(
  params: IssueCertificateParams
): Promise<IssueCertificateResult> {
  const { signer, clusterId, issuerName, issuerDescription, subject, expirationDate } = params;

  // Generate certificate ID
  const certificateId = generateCertificateId();

  // Create certificate DNA
  const dna = encodeCertificateDNA({
    id: certificateId,
    issuer: {
      id: clusterId, // Use cluster ID as issuer
      name: issuerName,
      description: issuerDescription,
    },
    subject,
    expirationDate,
  });

  // Serialize DNA to JSON
  const dnaJson = serializeDNA(dna);

  // Create Spore DOB with certificate DNA
  const { txHash } = await createSporeCell({
    data: {
      ...dna,
      _metadata: {
        contentType: 'application/json',
        encoding: 'utf-8',
      },
    },
    clusterId,
    from: signer,
  });

  return {
    certificateId,
    transactionHash: txHash,
  };
}

/**
 * Get certificate by ID (DNA hex from Spore cell args)
 */
export async function getCertificate(certificateId: string): Promise<GetCertificateResult | null> {
  try {
    const client = getDefaultClient();

    // Find the Spore cell with this certificate ID as the type script args
    const cells = await client.findCells({
      script: {
        codeHash: process.env.NEXT_PUBLIC_SPORE_CODE_HASH || '',
        hashType: 'data2',
        args: certificateId,
      },
      scriptType: 'type',
    });

    if (cells.length === 0) {
      return null;
    }

    const cell = cells[0];
    const data = cell.outputData;

    if (!data) {
      return null;
    }

    // Decode the certificate DNA
    const certificate = decodeCertificateDNA(data);

    return {
      certificate,
      certificateId,
      transactionHash: cell.outPoint.txHash,
      clusterId: cell.output.type?.args,
    };
  } catch (error) {
    console.error('Failed to get certificate:', error);
    return null;
  }
}

/**
 * Get all certificates for a holder address
 */
export async function getHolderCertificates(holderAddress: string): Promise<GetCertificateResult[]> {
  const client = getDefaultClient();

  // Find all Spore cells owned by the holder
  // This requires querying cells by lock script (holder address)
  const cells = await client.findCells({
    script: {
      codeHash: process.env.NEXT_PUBLIC_SPORE_CODE_HASH || '',
      hashType: 'data2',
    },
    scriptType: 'type',
    filter: {
      script: {
        codeHash: process.env.NEXT_PUBLIC_OMNILOCK_CODE_HASH || '',
        hashType: 'type',
        args: holderAddress,
      },
    },
  });

  const certificates: GetCertificateResult[] = [];

  for (const cell of cells) {
    try {
      const data = cell.outputData;
      if (!data) continue;

      const certificate = decodeCertificateDNA(data);
      const certificateId = cell.output.type?.args || '';

      certificates.push({
        certificate,
        certificateId,
        transactionHash: cell.outPoint.txHash,
        clusterId: certificate.issuer.id,
      });
    } catch (error) {
      console.error('Failed to parse certificate:', error);
    }
  }

  return certificates;
}

/**
 * Revoke a certificate
 * Note: This requires the certificate to support revocation (marking as revoked)
 * The actual revocation would be done by burning the cell or updating its status
 */
export async function revokeCertificate(
  signer: ccc.Signer,
  certificateId: string
): Promise<{ transactionHash: string }> {
  // For MVP, we would consume the Spore cell to "revoke" it
  // This is a placeholder - actual implementation depends on Spore SDK capabilities
  console.log('Revoking certificate:', certificateId);

  throw new Error('Revocation not yet implemented - requires consuming the Spore cell');
}
