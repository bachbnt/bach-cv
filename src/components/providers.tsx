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

const ONE_DAY = 24 * 60 * 60 * 1000;
/** Bump when a schema change makes cached data unreadable. */
const CACHE_VERSION = 'v2-3';

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
        // only `site/live` refetches when the tab gets the focus back (it says so itself); the content is read again when it is stale and a page needs it
        defaultOptions: {
          queries: { gcTime: ONE_DAY, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [persister] = useState<Persister>(() => {
    if (typeof window === 'undefined') return noopPersister;
    try {
      return createSyncStoragePersister({
        storage: window.localStorage,
        key: 'bach-cv-query',
      });
    } catch {
      // a browser that does not allow its storage throws when it is only read: the site works, it just keeps nothing
      return noopPersister;
    }
  });

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
            <ChatProvider>
              <RevealOnScroll />
              <PointerGlow />
              <SkinFrame>{children}</SkinFrame>
            </ChatProvider>
          </SkinProvider>
        </ThemeProvider>
      </LanguageProvider>
    </PersistQueryClientProvider>
  );
}
