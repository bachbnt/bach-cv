/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { DocumentTitle } from '@/components/document-title';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { DevStatusScreen } from '@/skins/dev/ui/dev-status-screen';

/** The tab title and the `site/live` page switch (`soon` shows Coming soon, `hidden` the 404); it fails open while the switches load. */
export function DevPage({
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
        <DevStatusScreen variant='soon' />
      ) : state === 'hidden' ? (
        <DevStatusScreen variant='notFound' />
      ) : (
        children
      )}
    </>
  );
}
