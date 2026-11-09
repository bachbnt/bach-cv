/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Caveat_Brush,
  Crimson_Pro,
  Kalam,
  Patrick_Hand,
  Playpen_Sans,
} from 'next/font/google';

// The skin is lazy: without `preload: false` these fonts would be preloaded by the static HTML of every page, Standard included.

/** The body: a book serif. */
export const serif = Crimson_Pro({
  variable: '--font-ac-crimson',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  preload: false,
});
/** Margin notes, labels, buttons, names on paper, the chat: handwriting. */
export const note = Kalam({
  variable: '--font-ac-kalam',
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '700'],
  preload: false,
});
/** Headings written on the board. */
export const chalk = Caveat_Brush({
  variable: '--font-ac-chalk',
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  preload: false,
});
/** The two handwriting fonts above have no Vietnamese letters: in Vietnamese (and for the odd letter in a name) these two take over. */
export const viNote = Patrick_Hand({
  variable: '--font-ac-patrick',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: '400',
  preload: false,
});
export const viChalk = Playpen_Sans({
  variable: '--font-ac-playpen',
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  weight: ['700'],
  preload: false,
});
