/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Roboto } from 'next/font/google';

/** The one family of the Stream skin. It is declared here, so it is only fetched with the skin. */
export const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '700'],
  // the skin is lazy: without this its font would be preloaded by the static HTML of every page, Standard included
  preload: false,
});
