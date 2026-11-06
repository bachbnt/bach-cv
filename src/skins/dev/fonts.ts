/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { JetBrains_Mono } from 'next/font/google';

/** The code font of the Dev skin (headings, labels, dates, code). It is declared here, so it is only fetched with the skin. */
export const mono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin', 'vietnamese'],
  // the skin is lazy: without this its font would be preloaded by the static HTML of every page, Standard included
  preload: false,
});
