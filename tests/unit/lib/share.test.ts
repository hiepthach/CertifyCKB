import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCertificateShareUrl, shareCertificate } from '../../../src/lib/share';
import * as utils from '../../../src/utils';

describe('Share Utility (lib/share)', () => {
  const mockCertId = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCertificateShareUrl', () => {
    it('should generate verify URL with certId query parameter', () => {
      const url = getCertificateShareUrl(mockCertId);
      expect(url).toContain('/verify?certId=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
    });
  });

  describe('shareCertificate', () => {
    it('should use navigator.share when available and return success', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        ...globalThis.navigator,
        share: mockShare,
      });

      const result = await shareCertificate(mockCertId);

      expect(mockShare).toHaveBeenCalledTimes(1);
      expect(mockShare).toHaveBeenCalledWith({
        title: 'View My Certificate',
        text: 'Check out this verifiable on-chain credential issued on Nervos CKB.',
        url: expect.stringContaining(`/verify?certId=${mockCertId}`),
      });
      expect(result).toEqual({
        success: true,
        method: 'native',
        message: 'Shared successfully',
      });
    });

    it('should handle AbortError gracefully when user cancels native share', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';

      const mockShare = vi.fn().mockRejectedValue(abortError);
      vi.stubGlobal('navigator', {
        ...globalThis.navigator,
        share: mockShare,
      });

      const result = await shareCertificate(mockCertId);

      expect(mockShare).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        method: 'none',
        message: 'Share cancelled',
      });
    });

    it('should fallback to copyToClipboard when navigator.share is unavailable', async () => {
      vi.stubGlobal('navigator', {
        ...globalThis.navigator,
        share: undefined,
      });

      const copySpy = vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(true);

      const result = await shareCertificate(mockCertId);

      expect(copySpy).toHaveBeenCalledTimes(1);
      expect(copySpy).toHaveBeenCalledWith(expect.stringContaining(`/verify?certId=${mockCertId}`));
      expect(result).toEqual({
        success: true,
        method: 'clipboard',
        message: 'Link copied to clipboard',
      });
    });

    it('should fallback to copyToClipboard when navigator.share throws unexpected error', async () => {
      const unexpectedError = new Error('Some native share error');

      const mockShare = vi.fn().mockRejectedValue(unexpectedError);
      vi.stubGlobal('navigator', {
        ...globalThis.navigator,
        share: mockShare,
      });

      const copySpy = vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(true);

      const result = await shareCertificate(mockCertId);

      expect(mockShare).toHaveBeenCalledTimes(1);
      expect(copySpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: true,
        method: 'clipboard',
        message: 'Link copied to clipboard',
      });
    });

    it('should return error when both native share and clipboard copy fail', async () => {
      vi.stubGlobal('navigator', {
        ...globalThis.navigator,
        share: undefined,
      });

      const copySpy = vi.spyOn(utils, 'copyToClipboard').mockResolvedValue(false);

      const result = await shareCertificate(mockCertId);

      expect(copySpy).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        success: false,
        method: 'none',
        message: 'Could not share. Please copy the URL manually.',
      });
    });
  });
});
