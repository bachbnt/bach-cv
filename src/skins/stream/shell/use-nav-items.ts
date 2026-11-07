/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { streamCopy } from '@/content/copy/stream';
import { useLive } from '@/hooks/use-live';
import { PAGES, type PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { PAGE_META } from '@/lib/pages';
import { orderPages } from '@/skins/stream/config';

export interface NavItem {
  page: PageKey;
  href: string;
  label: string;
  /** `soon` is listed but is not a link */
  state: 'on' | 'soon';
}

/** The pages of the navigation in the order of the skin: a page that is switched off (`hidden`) is absent, a `soon` one is marked. */
export function useNavItems(): NavItem[] {
  const { pages } = useLive();
  const common = useCopy(commonCopy);
  const stream = useCopy(streamCopy);
  const labels: Record<PageKey, string> = { ...common.nav, home: stream.home };

  return orderPages(
    PAGES.flatMap((page) => {
      const state = pages[page];
      return state === 'hidden'
        ? []
        : [{ page, href: PAGE_META[page].href, label: labels[page], state }];
    }),
  );
}
