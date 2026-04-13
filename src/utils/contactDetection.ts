import { FlagReasonType } from '../generated/prisma/client.js';

export interface DetectionMatch {
  type: FlagReasonType;
  match: string;
}

const ARABIC_DIGITS_MAP: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

function normalizeBaseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[٠-٩]/g, (char) => ARABIC_DIGITS_MAP[char] ?? char)
    .replace(/\u00A0/g, ' ')
    .replace(/\s*(?:dot|نقطه|نقطة)\s*/gi, '.')
    .replace(/[“”«»]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/\.{2,}/g, '.')
    .replace(/\[\.\]/g, '.')
    .replace(/\s*\.\s*/g, '.');
}

/**
 * Phone-only normalization.
 * More aggressive than base normalization, but only used for phone detection.
 */
function normalizePhoneText(text: string): string {
  return normalizeBaseText(text)
    .replace(/[oO]/g, '0')
    .replace(/[lI]/g, '1');
}

function dedupeMatches(matches: DetectionMatch[]): DetectionMatch[] {
  const typePriority: Record<string, number> = {
    [FlagReasonType.PHONE_EGYPT]: 1,
    [FlagReasonType.PHONE_INTERNATIONAL]: 2,
    [FlagReasonType.SOCIAL_HANDLE]: 3,
    [FlagReasonType.URL]: 4,
  };

  const sorted = [...matches].sort((a, b) => {
    if (b.match.length !== a.match.length) {
      return b.match.length - a.match.length; // Longest first
    }
    return (typePriority[a.type] ?? 99) - (typePriority[b.type] ?? 99);
  });

  const results: DetectionMatch[] = [];
  for (const m of sorted) {
    const isSubset = results.some((r) => r.match.includes(m.match));
    if (!isSubset) {
      results.push(m);
    }
  }
  return results;
}

function addRegexMatches(
  text: string,
  regex: RegExp,
  type: FlagReasonType,
  matches: DetectionMatch[]
) {
  regex.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const value = match[0].trim();
    if (value) matches.push({ type, match: value });
  }
}

function stripPhoneNoise(value: string): string {
  return value.replace(/[\s().\-_/\\]+/g, '');
}

function detectPhones(content: string, matches: DetectionMatch[]) {
  const text = normalizePhoneText(content);

  // Candidate chunks that look like phone numbers, even if obfuscated a bit.
  const phoneCandidateRegex = /(?:\+|00)?[\d][\d\s().\-_/\\]{6,}[\d]/g;

  phoneCandidateRegex.lastIndex = 0;
  let m: RegExpExecArray | null;

  while ((m = phoneCandidateRegex.exec(text)) !== null) {
    const raw = m[0].trim();
    const compact = stripPhoneNoise(raw);

    // Egypt local format: 01XYYYYYYYY
    if (/^01[0125]\d{8}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_EGYPT, match: raw });
      continue;
    }

    // Egypt international format: +20XXXXXXXXXX or 0020XXXXXXXXXX
    if (/^(?:\+20|0020)1[0125]\d{8}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_EGYPT, match: raw });
      continue;
    }

    // General international format.
    // Keep this after Egypt so Egyptian numbers don't get double-classified.
    if (/^(?:\+|00)\d{8,15}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_INTERNATIONAL, match: raw });
      continue;
    }

    // Optional fallback: plain long digit chunks that look like phone numbers.
    // Helpful for cases like "01012345678" without separators or prefix.
    if (/^\d{8,15}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_INTERNATIONAL, match: raw });
    }
  }
}

export function detectContactInfo(content: string): DetectionMatch[] {
  const matches: DetectionMatch[] = [];

  const baseText = normalizeBaseText(content);

  // URLs: keep this stricter to reduce false positives.
  // Protocol-based URLs and www links.
  const urlRegex = /\b(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>"')\]]+/gi;

  // Bare domains only when they look like real domains.
  const bareDomainRegex =
    /\b(?<!https?:\/\/)(?<!www\.)((?:[a-z0-9-]+\.)+[a-z]{2,24})(?:\/[^\s<>"')\]]*)?\b/gi;

  // Social handles and platform links.
  const atHandleRegex = /(^|[^a-z0-9_.])@([a-z0-9_.]{3,30})\b/gi;

  const socialUrlRegex =
  /\b(?:https?:\/\/)?(?:www\.)?(?:wa\.me|t\.me|telegram\.me|instagram\.com|facebook\.com|messenger\.com|snapchat\.com|tiktok\.com|twitter\.com|x\.com)(?:\/[^\s<>"')\]]*)?/gi;

  // Phone detection uses its own normalization.
  detectPhones(content, matches);

  // URLs
  addRegexMatches(baseText, urlRegex, FlagReasonType.URL, matches);
  addRegexMatches(baseText, bareDomainRegex, FlagReasonType.URL, matches);

  // Social URLs
  addRegexMatches(baseText, socialUrlRegex, FlagReasonType.SOCIAL_HANDLE, matches);

  // @handles, but not emails
  atHandleRegex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = atHandleRegex.exec(baseText)) !== null) {
    const handle = m[2]?.trim();
    if (!handle) continue;

    const prefix = m[1] ?? '';
    const fullMatch = `${prefix}@${handle}`;

    // Skip obvious email-like patterns
    if (prefix === '' && baseText.includes(`${handle}@`)) continue;

    matches.push({ type: FlagReasonType.SOCIAL_HANDLE, match: fullMatch.trim() });
  }

  return dedupeMatches(matches);
}