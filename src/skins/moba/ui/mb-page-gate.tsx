/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { mbButton } from '@/skins/moba/ui/mb-button';
import { MbGoBack } from '@/skins/moba/ui/mb-go-back';
import { MbStateScreen } from '@/skins/moba/ui/mb-state-screen';

/**
 * The page switch of `site/live`, as Standard applies it: `on` shows the page, `soon` the locked Coming soon screen, `hidden` the 404.
 * While the switches load the page shows (fail-open).
 */
export function MbPageGate({
  page,
  children,
}: {
  page: PageKey;
  children: ReactNode;
}) {
  const state = useLive().pages[page];
  const common = useCopy(commonCopy);
  const mb = useCopy(mobaCopy).states;
  if (state === 'on') return <>{children}</>;
  const soon = state === 'soon';
  const text = soon ? common.status.soon : common.status.notFound;
  return (
    <MbStateScreen
      code={soon ? common.soon : '404'}
      kicker={soon ? mb.soonKicker : mb.notFoundKicker}
      title={text.title}
      body={text.body}
      tone={soon ? 'gold' : 'red'}
    >
      <Link href='/' className={mbButton({ variant: 'gold' })}>
        {common.status.home}
      </Link>
      <MbGoBack>{common.status.back}</MbGoBack>
    </MbStateScreen>
  );
}
