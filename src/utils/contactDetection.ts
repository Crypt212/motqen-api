import { FlagReasonType } from '../generated/prisma/client.js';

export interface DetectionMatch {
  type: FlagReasonType;
  match: string;
}

/**
 * Normalizes Arabic numerals, obfuscated characters, and text to standard formats.
 */
export function normalizeText(text: string): string {
  let normalized = text;

  // Arabic numbers to English
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  normalized = normalized.replace(/[٠-٩]/g, (char) => arabicNumbers.indexOf(char).toString());

  // Obfuscated zero
  normalized = normalized.replace(/[oO]/g, '0');

  // Obfuscated dot
  normalized = normalized.replace(/\s*dot\s*/gi, '.');
  normalized = normalized.replace(/\s*نقطه\s*/gi, '.');
  normalized = normalized.replace(/\s*نقطة\s*/gi, '.');

  return normalized;
}

/**
 * Scans message content for sensitive contact/social info.
 */
export function detectContactInfo(content: string): DetectionMatch[] {
  const normalized = normalizeText(content);
  const matches: DetectionMatch[] = [];

  // Patterns
  // Egypt Phone: (01x) with 8 digits, allowing spaces/dots/dashes
  const egyptPhoneRegex = /(?:0|\+20)1[0125][\s\.\-]*(\d[\s\.\-]*){8}/g;

  // International Phone: (+ or 00) followed by 1-3 digits country code, then 6-14 digits
  const intlPhoneRegex = /(?:\+|00)\d{1,3}[\s\.\-]*(\d[\s\.\-]*){6,14}/g;

  // URLs (https://, http://, http///, http/./ or bare domain)
  // Matches domain.com or basic links.
  const urlRegex = /(https?[\/\\\.:]+|[a-z0-9\-]+\.[a-z]{2,})(\/[^\s]*)?/gi;

  // Social Handles including wa.me and facebook.com
  // @username, ig:, insta:, snap:, wa.me/, facebook.com/
  const socialRegex = /(?:@|ig:|insta:|snap:|wa\.me\/|facebook\.com\/)\s*[a-zA-Z0-9_\.\-]+/gi;

  // Helper to extract matches uniquely
  const addMatches = (regex: RegExp, type: FlagReasonType) => {
    let match;
    regex.lastIndex = 0; // reset global regex state just in case
    while ((match = regex.exec(normalized)) !== null) {
      // Don't add duplicate text for the same type (e.g. +20 vs 010 overlap could happen if patterns overlap, but here they might not)
      matches.push({ type, match: match[0].trim() });
    }
  };

  addMatches(egyptPhoneRegex, FlagReasonType.PHONE_EGYPT);

  // Avoid international phone picking up the same as Egyptian phone if it starts with +20
  // we could filter it, but it's simpler to just store all matches and let DB or admin filter.
  addMatches(intlPhoneRegex, FlagReasonType.PHONE_INTERNATIONAL);

  addMatches(urlRegex, FlagReasonType.URL);
  addMatches(socialRegex, FlagReasonType.SOCIAL_HANDLE);

  // Remove exact duplicates from matches array
  const uniqueMatches = Array.from(new Set(matches.map((m) => JSON.stringify(m)))).map(
    (str) => JSON.parse(str) as DetectionMatch
  );

  return uniqueMatches;
}
