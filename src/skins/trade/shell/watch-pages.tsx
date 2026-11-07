/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { navItems } from '@/skins/trade/config';
import { rovingKeys } from '@/skins/trade/shell/roving-keys';
import { useCounts } from '@/skins/trade/shell/use-counts';
import { WatchRow } from '@/skins/trade/shell/watch-row';

/** The Pages list of the watchlist, and the navigation of the site: a hidden page is absent, a page coming soon is marked and is not a link. */
export function WatchPages({ page }: { page: PageKey | null }) {
  const common = useCopy(commonCopy);
  const { pages } = useLive();
  const counts = useCounts();
  return (
    <nav aria-label={common.mainNav} onKeyDown={rovingKeys}>
      <ul>
        {navItems(pages).map(({ page: item, soon }) => (
          <WatchRow
            key={item}
            page={item}
            soon={soon}
            current={item === page}
            count={counts[item] ?? null}
          />
        ))}
      </ul>
    </nav>
  );
}
