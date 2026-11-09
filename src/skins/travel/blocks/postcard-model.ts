/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { Doc, Lang } from '@/lib/content/schema';
import { formatMonth } from '@/lib/format';

/** How far each postcard of the strip leans (`--r`, in degrees); the strip repeats the list. Whole class names, so Tailwind finds them. */
const TILT_CLASSES = [
  '[--r:-2.2deg]',
  '[--r:1.6deg]',
  '[--r:-1deg]',
  '[--r:2deg]',
  '[--r:-1.8deg]',
] as const;
export const tiltClass = (index: number): string =>
  TILT_CLASSES[
    ((index % TILT_CLASSES.length) + TILT_CLASSES.length) % TILT_CLASSES.length
  ];

/** How far each rubber stamp of the passport is turned (`--r`); like the postcards, the list repeats. */
const STAMP_TURNS = [
  '[--r:-8deg]',
  '[--r:5deg]',
  '[--r:-3deg]',
  '[--r:7deg]',
  '[--r:-5deg]',
] as const;
export const stampTurnClass = (index: number): string =>
  STAMP_TURNS[
    ((index % STAMP_TURNS.length) + STAMP_TURNS.length) % STAMP_TURNS.length
  ];

/** The stop colour (`--tl-stop-1..6`) that tints a skill category on a postcard, as Standard tints its tags: mobile green, web blue, AI violet, tools amber. */
export const STOP_OF_CATEGORY: Record<Doc<'skills'>['category'], number> = {
  mobile: 6,
  web: 1,
  ai: 5,
  tools: 4,
};

/** The stop colour of the n-th item of a list (the first six colours, repeated). */
export const stopOfIndex = (index: number): number =>
  (((index % 6) + 6) % 6) + 1;

/** Whole class names, so Tailwind finds them: they set `--tl-pc`, the colour that an item of the page wears (a stamp, a tile, a tag dot). */
const STOP_CLASSES = [
  '[--tl-pc:var(--tl-stop-1)]',
  '[--tl-pc:var(--tl-stop-2)]',
  '[--tl-pc:var(--tl-stop-3)]',
  '[--tl-pc:var(--tl-stop-4)]',
  '[--tl-pc:var(--tl-stop-5)]',
  '[--tl-pc:var(--tl-stop-6)]',
] as const;
export const stopClass = (stop: number): string =>
  STOP_CLASSES[(((stop - 1) % 6) + 6) % 6];

interface StampParts {
  /** the first name of the issuer: "Google / Coursera" is "Google" */
  issuer: string;
  /** the month as the site writes it ("May", "Thg 5") */
  month: string;
  year: string;
}

/** What is printed on the round stamp of a certificate. The month words are the ones of `formatMonth`, so both languages agree with the rest of the site. */
export function stampParts(
  certificate: Pick<Doc<'certificates'>, 'issuer' | 'issuedAt'>,
  lang: Lang,
): StampParts {
  const [first = ''] = certificate.issuer.split('/');
  const text = formatMonth(certificate.issuedAt.slice(0, 7), lang);
  const cut = text.lastIndexOf(' ');
  return {
    issuer: first.trim(),
    month: text.slice(0, cut),
    year: text.slice(cut + 1),
  };
}
