import { copyToClipboard } from '@/utils';

export function getCertificateShareUrl(certificateId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const params = new URLSearchParams({ certId: certificateId });
  return `${baseUrl}/verify?${params.toString()}`;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'none';
  message: string;
}

export async function shareCertificate(certificateId: string): Promise<ShareResult> {
  const url = getCertificateShareUrl(certificateId);

  const title = 'View My Certificate';
  const text = 'Check out this verifiable on-chain credential issued on Nervos CKB.';

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return { success: true, method: 'native', message: 'Shared successfully' };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: true, method: 'none', message: 'Share cancelled' };
      }
    }
  }

  const copied = await copyToClipboard(url);
  if (copied) {
    return { success: true, method: 'clipboard', message: 'Link copied to clipboard' };
  }

  return { success: false, method: 'none', message: 'Could not share. Please copy the URL manually.' };
}
