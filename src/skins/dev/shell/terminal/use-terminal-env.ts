/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo } from 'react';
import { devTerminalCopy } from '@/content/copy/dev-terminal';
import { useLive } from '@/hooks/use-live';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { NAV_PAGES } from '@/lib/pages';
import { DEV_FILES } from '@/skins/dev/config';
import type { TerminalEnv } from '@/skins/dev/shell/terminal/run-command';

/** The pages in the order of the tabs, Home first. */
const ORDER: PageKey[] = ['home', ...NAV_PAGES];

/** What the commands depend on: the visitor's language, the state of each page and the feature switches (`site/live`). */
export function useTerminalEnv(): TerminalEnv {
  const copy = useCopy(devTerminalCopy);
  const live = useLive();
  return useMemo(
    () => ({
      copy,
      pages: ORDER.map((key) => ({
        key,
        file: DEV_FILES[key].name,
        state: live.pages[key],
      })),
      features: {
        cv: live.features.cvDownload,
        connect: live.features.connectMenu,
        ask: live.features.chat,
      },
    }),
    [copy, live],
  );
}
