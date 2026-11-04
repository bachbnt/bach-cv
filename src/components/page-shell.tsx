/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { PageGate } from '@/components/page-gate';
import { SitePage } from '@/components/site-page';
import type { PageKey } from '@/lib/content/schema';

/** What every page except Home is wrapped in: colours, header, the page switch, <main>, footer. */
export function PageShell({
  page,
  children,
}: {
  page: Exclude<PageKey, 'home'>;
  children: ReactNode;
}) {
  return (
    <SitePage page={page}>
      <main className='flex flex-col'>
        <PageGate page={page}>{children}</PageGate>
      </main>
    </SitePage>
  );
}
