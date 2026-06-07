import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma enums before importing the module under test
vi.mock('../../../src/generated/prisma/client.js', () => ({
  FlagReasonType: {
    PHONE_EGYPT: 'PHONE_EGYPT',
    PHONE_INTERNATIONAL: 'PHONE_INTERNATIONAL',
    SOCIAL_HANDLE: 'SOCIAL_HANDLE',
    URL: 'URL',
  },
}));

import { detectContactInfo, type DetectionMatch } from '../../../src/utils/contactDetection.js';

/** Helper: assert that at least one match has the given type */
function expectType(matches: DetectionMatch[], type: string) {
  expect(matches.some((m) => m.type === type)).toBe(true);
}

/** Helper: assert that NO match has the given type */
function expectNoType(matches: DetectionMatch[], type: string) {
  expect(matches.some((m) => m.type === type)).toBe(false);
}

// ─── Egyptian Phone Numbers ────────────────────────────────────
describe('detectContactInfo', () => {
  describe('Egyptian phone numbers', () => {
    it('detects local format 01012345678', () => {
      const matches = detectContactInfo('اتصل بي على 01012345678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects Vodafone prefix 010', () => {
      const matches = detectContactInfo('01012345678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects Orange prefix 012', () => {
      const matches = detectContactInfo('01212345678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects Etisalat prefix 011', () => {
      const matches = detectContactInfo('01112345678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects WE prefix 015', () => {
      const matches = detectContactInfo('01512345678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects international format +201012345678', () => {
      const matches = detectContactInfo('رقمي +201012345678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects double-zero format 0020 101 234 5678', () => {
      const matches = detectContactInfo('0020 101 234 5678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects number with spaces 010 1234 5678', () => {
      const matches = detectContactInfo('رقمي 010 1234 5678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects Arabic digits ٠١٠١٢٣٤٥٦٧٨', () => {
      const matches = detectContactInfo('رقمي ٠١٠١٢٣٤٥٦٧٨');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects number with dashes 010-1234-5678', () => {
      const matches = detectContactInfo('010-1234-5678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects number with dots 010.1234.5678', () => {
      const matches = detectContactInfo('010.1234.5678');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('detects number with parentheses (010) 12345678', () => {
      const matches = detectContactInfo('(010) 12345678');
      expectType(matches, 'PHONE_EGYPT');
    });
  });

  // ─── International Phone Numbers ──────────────────────────────
  describe('International phone numbers', () => {
    it('detects UK number +442071234567', () => {
      const matches = detectContactInfo('+442071234567');
      expectType(matches, 'PHONE_INTERNATIONAL');
    });

    it('detects US number +1 555 123 4567', () => {
      const matches = detectContactInfo('+1 555 123 4567');
      expectType(matches, 'PHONE_INTERNATIONAL');
    });

    it('detects number with 00 prefix 0044207123456', () => {
      const matches = detectContactInfo('0044207123456');
      expectType(matches, 'PHONE_INTERNATIONAL');
    });

    it('detects Saudi number +966501234567', () => {
      const matches = detectContactInfo('+966501234567');
      expectType(matches, 'PHONE_INTERNATIONAL');
    });

    it('detects UAE number +971501234567', () => {
      const matches = detectContactInfo('+971501234567');
      expectType(matches, 'PHONE_INTERNATIONAL');
    });
  });

  // ─── URLs ─────────────────────────────────────────────────────
  describe('URLs', () => {
    it('detects https URL', () => {
      const matches = detectContactInfo('visit https://example.com');
      expectType(matches, 'URL');
    });

    it('detects http URL with path', () => {
      const matches = detectContactInfo('see http://test.org/page');
      expectType(matches, 'URL');
    });

    it('detects www link', () => {
      const matches = detectContactInfo('go to www.google.com');
      expectType(matches, 'URL');
    });

    it('detects https URL with query params', () => {
      const matches = detectContactInfo('https://example.com/path?q=hello&page=1');
      expectType(matches, 'URL');
    });

    it('detects ftp URL', () => {
      const matches = detectContactInfo('download from ftp://files.example.com/data');
      expectType(matches, 'URL');
    });

    it('detects bare domain like example.com', () => {
      const matches = detectContactInfo('check example.com for info');
      expectType(matches, 'URL');
    });
  });

  // ─── Social Handles ───────────────────────────────────────────
  describe('Social handles', () => {
    it('detects @username handle', () => {
      const matches = detectContactInfo('@username');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects Instagram link instagram.com/user', () => {
      const matches = detectContactInfo('follow me instagram.com/user');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects WhatsApp link wa.me/201234567890', () => {
      const matches = detectContactInfo('wa.me/201234567890');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects Telegram link t.me/username', () => {
      const matches = detectContactInfo('t.me/username');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects Facebook link facebook.com/profile', () => {
      const matches = detectContactInfo('facebook.com/profile');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects Twitter / X link x.com/user', () => {
      const matches = detectContactInfo('x.com/user');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects TikTok link tiktok.com/@user', () => {
      const matches = detectContactInfo('tiktok.com/@user');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects Snapchat link snapchat.com/add/user', () => {
      const matches = detectContactInfo('snapchat.com/add/user');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects social URL with https prefix', () => {
      const matches = detectContactInfo('https://www.instagram.com/myprofile');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects messenger.com link', () => {
      const matches = detectContactInfo('messenger.com/t/username');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('detects telegram.me link', () => {
      const matches = detectContactInfo('telegram.me/mybot');
      expectType(matches, 'SOCIAL_HANDLE');
    });
  });

  // ─── Clean Messages (no detection) ────────────────────────────
  describe('Clean messages (no contact info)', () => {
    it('returns empty for plain greeting', () => {
      const matches = detectContactInfo('Hello, how are you?');
      expect(matches).toHaveLength(0);
    });

    it('returns empty for price mention', () => {
      const matches = detectContactInfo('The price is 500 EGP');
      expect(matches).toHaveLength(0);
    });

    it('returns empty for location reference', () => {
      const matches = detectContactInfo("I'll be at location 3");
      expect(matches).toHaveLength(0);
    });

    it('returns empty for Arabic text without contact info', () => {
      const matches = detectContactInfo('أنا بخير والحمد لله');
      expect(matches).toHaveLength(0);
    });

    it('returns empty for short numbers that are not phones', () => {
      const matches = detectContactInfo('Order #1234');
      expect(matches).toHaveLength(0);
    });

    it('returns empty for percentage string', () => {
      const matches = detectContactInfo('50% discount available');
      expect(matches).toHaveLength(0);
    });

    it('returns empty for empty string', () => {
      const matches = detectContactInfo('');
      expect(matches).toHaveLength(0);
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────
  describe('Edge cases', () => {
    it('detects multiple contact types in one message', () => {
      const matches = detectContactInfo(
        'Call me on 01012345678 and visit https://example.com and @myhandle'
      );
      expect(matches.length).toBeGreaterThanOrEqual(3);
      expectType(matches, 'PHONE_EGYPT');
      expectType(matches, 'URL');
      expectType(matches, 'SOCIAL_HANDLE');
    });

    it('handles obfuscated dot notation: example dot com', () => {
      const matches = detectContactInfo('visit example dot com');
      // After normalization "dot" → ".", so "example.com" should be detected
      expectType(matches, 'URL');
    });

    it('handles Arabic dot notation: example نقطة com', () => {
      const matches = detectContactInfo('example نقطة com');
      expectType(matches, 'URL');
    });

    it('deduplicates overlapping matches', () => {
      // A social URL like instagram.com/user could match both SOCIAL_HANDLE and URL
      // Deduplication should keep the higher-priority match
      const matches = detectContactInfo('instagram.com/user');
      // Should not have duplicates for the same underlying text
      const matchTexts = matches.map((m) => m.match);
      const uniqueTexts = [...new Set(matchTexts)];
      // Each unique match text should appear at most once
      expect(matchTexts.length).toBe(uniqueTexts.length);
    });

    it('detects phone number in Arabic text with mixed digits', () => {
      const matches = detectContactInfo('اتصل على ٠١٠ ١٢٣٤ ٥٦٧٨ لمزيد من المعلومات');
      expectType(matches, 'PHONE_EGYPT');
    });

    it('handles text with multiple phone numbers', () => {
      const matches = detectContactInfo('01012345678 and +442071234567');
      expectType(matches, 'PHONE_EGYPT');
      expectType(matches, 'PHONE_INTERNATIONAL');
    });

    it('handles bracket-obfuscated dots: example[.]com', () => {
      const matches = detectContactInfo('example[.]com');
      expectType(matches, 'URL');
    });

    it('does not classify email-like patterns as @handle', () => {
      // The function specifically skips email-like patterns
      const matches = detectContactInfo('email user@example.com');
      // Should detect URL for example.com but not @handle for user
      expectNoType(matches, 'SOCIAL_HANDLE');
    });
  });
});
