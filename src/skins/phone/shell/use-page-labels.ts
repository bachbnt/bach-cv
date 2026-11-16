/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { phoneCopy } from '@/content/copy/phone';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';

/**
 * The names of the pages as the rail and the app bar say them: the Standard ones, except the first page, which Standard has no tab for
 * (its logo goes there), so the skin names it. `soon` is the word of the tag of a page that is coming soon.
 */
export function usePageLabels(): {
  label: (page: PageKey) => string;
  soon: string;
} {
  const copy = useCopy(phoneCopy);
  const common = useCopy(commonCopy);
  return {
    label: (page) => (page === 'home' ? copy.home : common.nav[page]),
    soon: common.soon,
  };
}
