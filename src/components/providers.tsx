/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import {
  PersistQueryClientProvider,
  type Persister,
} from '@tanstack/react-query-persist-client';
import { useState, type ReactNode } from 'react';
import { ChatProvider } from '@/components/chat/chat-provider';
import { PointerGlow } from '@/components/pointer-glow';
import { RevealOnScroll } from '@/components/reveal-on-scroll';
import { SkinFrame } from '@/components/skin-frame';
import { SkinProvider } from '@/lib/skin/skin';
import { LanguageProvider } from '@/lib/i18n/language';
import { ThemeProvider } from '@/lib/theme/theme';
import { TooltipProvider } from '@/components/ui/tooltip';

const ONE_DAY = 24 * 60 * 60 * 1000;
/** Bump when a schema change makes cached data unreadable. */
const CACHE_VERSION = 'v2-2';

/** While prerendering there is no `window`, so nothing is persisted or restored. */
const noopPersister: Persister = {
  persistClient: async () => {},
  restoreClient: async () => undefined,
  removeClient: async () => {},
};

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        // gcTime must cover the persisted maxAge, or the cache is dropped before it can be restored
        defaultOptions: { queries: { gcTime: ONE_DAY, retry: 1 } },
      }),
  );
  const [persister] = useState<Persister>(() =>
    typeof window === 'undefined'
      ? noopPersister
      : createSyncStoragePersister({
          storage: window.localStorage,
          key: 'bach-cv-query',
        }),
  );

  return (
    <PersistQueryClientProvider
      client={client}
      persistOptions={{
        persister,
        maxAge: ONE_DAY,
        buster: CACHE_VERSION,
        dehydrateOptions: {
          // payment details are read when the Payment page opens and are not kept in the browser's storage
          shouldDehydrateQuery: (query) =>
            defaultShouldDehydrateQuery(query) &&
            !(
              query.queryKey[0] === 'content' &&
              query.queryKey[1] === 'payments'
            ),
        },
      }}
    >
      <LanguageProvider>
        <ThemeProvider>
          <SkinProvider>
            <TooltipProvider>
              <ChatProvider>
                <RevealOnScroll />
                <PointerGlow />
                <SkinFrame>{children}</SkinFrame>
              </ChatProvider>
            </TooltipProvider>
          </SkinProvider>
        </ThemeProvider>
      </LanguageProvider>
    </PersistQueryClientProvider>
  );
}
