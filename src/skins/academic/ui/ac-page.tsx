/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { DocumentTitle } from '@/components/document-title';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { AcStatusScreen } from '@/skins/academic/ui/ac-status-screen';

/** The tab title and the `site/live` page switch (`soon` shows Coming soon, `hidden` the 404); it fails open while the switches load. */
export function AcPage({
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
        <AcStatusScreen variant='soon' />
      ) : state === 'hidden' ? (
        <AcStatusScreen variant='notFound' />
      ) : (
        children
      )}
    </>
  );
}
