/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import type { PageKey } from '@/lib/content/schema';
import { AppBar } from '@/skins/phone/shell/app-bar';
import { Rail } from '@/skins/phone/shell/rail';
import { PhScrollSentinel } from '@/skins/phone/shell/scroll-sentinel';

/** An app: the rail of the other apps at its side on a tablet layout, then the bar and the page. The page begins under the bar and the status bar, which lie over it. It is what grows out of the icon when the app opens. */
export function AppWindow({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  return (
    <div className='relative flex flex-1 bg-ph-sheet'>
      <PhScrollSentinel />
      {page && <Rail page={page} />}
      <div className='flex min-w-0 flex-1 flex-col pt-(--ph-bar-top)'>
        <AppBar />
        <div className='flex flex-1 flex-col'>{children}</div>
      </div>
    </div>
  );
}
