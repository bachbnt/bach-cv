/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The years in software as words for a sentence of the copy ("7 years", "Seven years", "7 năm").

import type { Lang } from '@/lib/content/schema';

const WORDS: Record<Lang, string[]> = {
  en: [
    'zero',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
    'twelve',
    'thirteen',
    'fourteen',
    'fifteen',
    'sixteen',
    'seventeen',
    'eighteen',
    'nineteen',
    'twenty',
  ],
  vi: [
    'không',
    'một',
    'hai',
    'ba',
    'bốn',
    'năm',
    'sáu',
    'bảy',
    'tám',
    'chín',
    'mười',
    'mười một',
    'mười hai',
    'mười ba',
    'mười bốn',
    'mười lăm',
    'mười sáu',
    'mười bảy',
    'mười tám',
    'mười chín',
    'hai mươi',
  ],
};

/**
 * A number of years for the slot `{years}` of a sentence: "7 years", "1 year", "7 năm"; with `spelled` the number is a word with a
 * capital ("Seven years", "Bảy năm") for a sentence that starts with it. Past twenty the number stays a digit.
 */
export function yearsPhrase(
  years: number,
  lang: Lang,
  options: { spelled?: boolean } = {},
): string {
  const spelledOut = options.spelled ? WORDS[lang][years] : undefined;
  const number = spelledOut
    ? spelledOut.charAt(0).toUpperCase() + spelledOut.slice(1)
    : String(years);
  if (lang === 'vi') return `${number} năm`;
  return `${number} ${years === 1 ? 'year' : 'years'}`;
}
