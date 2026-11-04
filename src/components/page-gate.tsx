/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { StatusScreen } from '@/components/status-screen';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';

/**
 * Applies the page switch from `site/live`: `on` shows the page, `soon` shows Coming soon,
 * `hidden` shows the 404 screen. While the switches load, the page shows (fail-open).
 */
export function PageGate({
  page,
  children,
}: {
  page: PageKey;
  children: ReactNode;
}) {
  const state = useLive().pages[page];
  if (state === 'soon') return <StatusScreen variant='soon' />;
  if (state === 'hidden') return <StatusScreen variant='notFound' />;
  return <>{children}</>;
}
