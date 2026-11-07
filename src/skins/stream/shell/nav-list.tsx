/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { PageKey } from '@/lib/content/schema';
import { MORE_PAGES } from '@/skins/stream/config';
import { NavRow } from '@/skins/stream/shell/nav-row';
import { useNavItems } from '@/skins/stream/shell/use-nav-items';

/** The pages as rows: the main four, a divider, then the rest. Used by the sidebar and by the drawer. */
export function NavList({
  current,
  onNavigate,
}: {
  current: PageKey | null;
  onNavigate?: () => void;
}) {
  const items = useNavItems();
  const more = items.filter((item) =>
    (MORE_PAGES as readonly PageKey[]).includes(item.page),
  );
  const main = items.filter((item) => !more.includes(item));

  return (
    <>
      <ul className='m-0 flex list-none flex-col gap-0.5 p-0'>
        {main.map((item) => (
          <li key={item.page}>
            <NavRow item={item} current={current} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
      {more.length > 0 && (
        <>
          <hr className='my-3 border-0 border-t border-sm-line' />
          <ul className='m-0 flex list-none flex-col gap-0.5 p-0'>
            {more.map((item) => (
              <li key={item.page}>
                <NavRow item={item} current={current} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
