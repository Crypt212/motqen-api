import { FlagReasonType } from '../generated/prisma/client.js';

export interface DetectionMatch {
  type: FlagReasonType;
  match: string;
}

// 1. خريطة الأرقام العربية/الهندية (لتحقيق Test Arabic numerals)
const ARABIC_DIGITS_MAP: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

// 2. خريطة الأرقام المكتوبة بالحروف (لتحقيق Test numbers written in words)
const NUMBER_WORDS_MAP: Record<string, string> = {
  // English
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  // Arabic
  'صفر': '0', 'زيرو': '0',
  'واحد': '1',
  'اتنين': '2', 'اثنين': '2', 'اثنان': '2',
  'تلاته': '3', 'تلاتة': '3', 'ثلاثه': '3', 'ثلاثة': '3',
  'اربعه': '4', 'اربعة': '4', 'أربعه': '4', 'أربعة': '4',
  'خمسه': '5', 'خمسة': '5',
  'سته': '6', 'ستة': '6',
  'سبعه': '7', 'سبعة': '7',
  'تمانيه': '8', 'ثمانيه': '8', 'ثمانية': '8', 'تمانية': '8',
  'تسعه': '9', 'تسعة': '9'
};

/**
 * دالة ذكية لتحويل الكلمات إلى أرقام
 */
function replaceWordsWithDigits(text: string): string {
  let result = text;
  
  // تحويل الكلمات الإنجليزية
  const engWords = Object.keys(NUMBER_WORDS_MAP).filter(k => /^[a-z]+$/.test(k)).join('|');
  result = result.replace(new RegExp(`\\b(${engWords})\\b`, 'gi'), match => NUMBER_WORDS_MAP[match.toLowerCase()]);

  // تحويل الكلمات العربية (باستخدام حدود آمنة لضمان عدم استبدال جزء من كلمة عادية)
  const arWords = Object.keys(NUMBER_WORDS_MAP).filter(k => !/^[a-z]+$/.test(k)).join('|');
  const arRegex = new RegExp(`(^|[\\s\\.,\\-_])(${arWords})(?=[\\s\\.,\\-_]|$)`, 'g');
  
  // يتم تشغيلها مرتين للتعامل مع الكلمات المتتالية (مثل: واحد اتنين)
  result = result.replace(arRegex, (match, p1, p2) => p1 + NUMBER_WORDS_MAP[p2]);
  result = result.replace(arRegex, (match, p1, p2) => p1 + NUMBER_WORDS_MAP[p2]);

  return result;
}

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
 * لتحقيق (Test letter substitution & Numbers written in words)
 */
function normalizePhoneText(text: string): string {
  let normalized = normalizeBaseText(text).replace(/[oO]/g, '0').replace(/[lI]/g, '1');
  normalized = replaceWordsWithDigits(normalized);
  return normalized;
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

/**
 * يزيل أي تشويش بين الأرقام لتحقيق (Test spaced/dashed numbers)
 */
function stripPhoneNoise(value: string): string {
  return value.replace(/[\s().\-_/\\]+/g, '');
}

function detectPhones(content: string, matches: DetectionMatch[]) {
  const text = normalizePhoneText(content);

  // يقبل الأرقام المتباعدة والمنفصلة برموز
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

    // Egypt international format
    if (/^(?:\+20|0020)1[0125]\d{8}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_EGYPT, match: raw });
      continue;
    }

    // General international format
    if (/^(?:\+|00)\d{8,15}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_INTERNATIONAL, match: raw });
      continue;
    }

    // Optional fallback
    if (/^\d{8,15}$/.test(compact)) {
      matches.push({ type: FlagReasonType.PHONE_INTERNATIONAL, match: raw });
    }
  }
}

export function detectContactInfo(content: string): DetectionMatch[] {
  const matches: DetectionMatch[] = [];

  const baseText = normalizeBaseText(content);

  // URLs
  const urlRegex = /\b(?:https?:\/\/|ftp:\/\/|www\.)[^\s<>"')\]]+/gi;
  const bareDomainRegex = /\b(?<!https?:\/\/)(?<!www\.)((?:[a-z0-9-]+\.)+[a-z]{2,24})(?:\/[^\s<>"')\]]*)?\b/gi;

  // Social handles and platform links
  const atHandleRegex = /(^|[^a-z0-9_.])@([a-z0-9_.]{3,30})\b/gi;
  const socialUrlRegex = /\b(?:https?:\/\/)?(?:www\.)?(?:wa\.me|t\.me|telegram\.me|instagram\.com|facebook\.com|messenger\.com|snapchat\.com|tiktok\.com|twitter\.com|x\.com)(?:\/[^\s<>"')\]]*)?/gi;

  // 3. رادار التطبيقات (لتحقيق Test WhatsApp mentions & Telegram/app name mentions)
  const appMentionsRegex = /\b(whatsapp|telegram|viber|snapchat|insta|instagram)\b|واتس\s*اب|واتساب|واتس|تليجرام|تلجرام|سناب\s*شات|سناب|انستا|فايبر/gi;

  // استخراج الأرقام بعد التصفية
  detectPhones(content, matches);

  // URLs
  addRegexMatches(baseText, urlRegex, FlagReasonType.URL, matches);
  addRegexMatches(baseText, bareDomainRegex, FlagReasonType.URL, matches);

  // Social URLs & App Mentions
  addRegexMatches(baseText, socialUrlRegex, FlagReasonType.SOCIAL_HANDLE, matches);
  addRegexMatches(baseText, appMentionsRegex, FlagReasonType.SOCIAL_HANDLE, matches);

  // @handles
  atHandleRegex.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = atHandleRegex.exec(baseText)) !== null) {
    const handle = m[2]?.trim();
    if (!handle) continue;

    const prefix = m[1] ?? '';
    const fullMatch = `${prefix}@${handle}`;

    if (prefix === '' && baseText.includes(`${handle}@`)) continue;

    matches.push({ type: FlagReasonType.SOCIAL_HANDLE, match: fullMatch.trim() });
  }

  return dedupeMatches(matches);
}