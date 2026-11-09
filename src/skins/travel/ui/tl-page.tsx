/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { DocumentTitle } from '@/components/document-title';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { TlStatusScreen } from '@/skins/travel/ui/tl-status-screen';

/** The tab title and the `site/live` page switch (`soon` shows Coming soon, `hidden` the 404); it fails open while the switches load. */
export function TlPage({
  page,
  children,
}: {
  page: PageKey;
  children: ReactNode;
}) {
  const state = useLive().pages[page];
  return (
    <>
      <DocumentTitle page={page} />
      {state === 'soon' ? (
        <TlStatusScreen variant='soon' />
      ) : state === 'hidden' ? (
        <TlStatusScreen variant='notFound' />
      ) : (
        children
      )}
    </>
  );
}
