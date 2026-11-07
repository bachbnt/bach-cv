/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// A degree abbreviated (MSc, BSc), in English and Vietnamese.

/** The level and the field of a degree, in English and in Vietnamese (the data comes in the visitor's language), as they are abbreviated. */
const LEVEL: Record<string, string> = {
  bachelor: 'B',
  master: 'M',
  'cử nhân': 'B',
  'thạc sĩ': 'M',
};
const FIELD: Record<string, string> = {
  science: 'Sc',
  engineering: 'Eng',
  arts: 'A',
  'khoa học': 'Sc',
  'kỹ thuật': 'Eng',
};

/**
 * `Master of Science` (or `Thạc sĩ Khoa học`) is `MSc`, `Bachelor of Science` is `BSc`. A degree that is not one of these (a PhD, an
 * MBA, a field not listed) is kept as it is, so the abbreviation is never a guess.
 */
export function shortDegree(degree: string): string {
  const match = degree
    .trim()
    .toLowerCase()
    .match(/^(bachelor|master|cử nhân|thạc sĩ)(?:\s+of)?\s+(.+)$/u);
  const level = match && LEVEL[match[1]];
  const field = match && FIELD[match[2]];
  return level && field ? `${level}${field}` : degree.trim();
}
