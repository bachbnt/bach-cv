/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Cormorant_Garamond } from 'next/font/google';

/** The serif of titles, names and numbers of the Moba skin (the carved-gold look). It is declared here, so it is only fetched with the skin. */
export const display = Cormorant_Garamond({
  variable: '--font-mb-display',
  subsets: ['latin', 'vietnamese'],
  weight: ['600', '700'],
  // the skin is lazy: without this its font would be preloaded by the static HTML of every page, Standard included
  preload: false,
});
