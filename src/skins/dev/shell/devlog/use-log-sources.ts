/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { isCancelledError, useQueryClient } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useChat } from '@/components/chat/chat-provider';
import { COPIED_EVENT } from '@/lib/copied-event';
import { useLang } from '@/lib/i18n/language';
import { useTheme } from '@/lib/theme/theme';
import { startPerfLog } from '@/skins/dev/shell/devlog/perf';
import { emit } from '@/skins/dev/shell/devlog/store';
import type { SettingName, UiAction } from '@/skins/dev/shell/devlog/events';

/** Set once the first line of this page load is written, so a remount (React Strict Mode, a change of skin) does not repeat it. */
let pageStarted = false;
let scanned = false;

/** `ready`, the timings of the page, the uncaught errors and the copy button: what belongs to the page, not to a React tree. */
function usePageLog() {
  useEffect(() => {
    if (!pageStarted) {
      pageStarted = true;
      emit({ kind: 'ready', ms: performance.now() });
    }
    const stopPerf = startPerfLog();
    // Only the type of an error is read: never its message, its stack, a file name or a URL.
    const onError = (event: ErrorEvent) => {
      // the browser's own notice about layout work it postponed: not a fault of the site
      if (event.message?.startsWith('ResizeObserver loop')) return;
      emit({ kind: 'runtime', source: 'error', error: event.error });
    };
    const onRejection = (event: PromiseRejectionEvent) =>
      emit({ kind: 'runtime', source: 'rejection', error: event.reason });
    const onCopied = () => emit({ kind: 'ui', action: 'copied' });
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    window.addEventListener(COPIED_EVENT, onCopied);
    return () => {
      stopPerf();
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
      window.removeEventListener(COPIED_EVENT, onCopied);
    };
  }, []);
}

/** What the queries do: a read (with the number of documents and the time it took) or a failure (with the type of the error only). */
function useQueryLog() {
  const client = useQueryClient();
  useEffect(() => {
    const cache = client.getQueryCache();
    const started = new Map<string, number>();
    const count = (data: unknown) =>
      Array.isArray(data) ? data.length : undefined;

    // a read that is under way when this mounts: timed from here
    for (const query of cache.getAll()) {
      if (query.state.fetchStatus === 'fetching') {
        started.set(query.queryHash, performance.now());
      }
    }
    // what was read before this shell mounted (the header reads `site/live` first)
    if (!scanned) {
      scanned = true;
      for (const query of cache.getAll()) {
        // the tries that failed before this mounted (the skin loads after the data on a slow machine): a query that gave up has one
        // failure more than it has retries, one that is trying again has all of them
        const failures = query.state.fetchFailureCount;
        const missed =
          query.state.fetchStatus === 'fetching'
            ? failures
            : query.state.status === 'error'
              ? failures - 1
              : 0;
        for (let attempt = 1; attempt <= missed; attempt += 1) {
          emit({ kind: 'query-retry', key: query.queryKey, attempt });
        }
        if (
          query.state.status === 'success' &&
          query.state.fetchStatus !== 'fetching'
        ) {
          emit({
            kind: 'query-read',
            key: query.queryKey,
            docs: count(query.state.data),
            // data older than this page load came back from the browser's cache
            cached: query.state.dataUpdatedAt < performance.timeOrigin,
          });
        } else if (query.state.status === 'error') {
          emit({
            kind: 'query-failed',
            key: query.queryKey,
            error: query.state.error,
          });
        }
      }
    }

    return cache.subscribe((event) => {
      if (event.type !== 'updated') return;
      const { query, action } = event;
      switch (action.type) {
        case 'fetch':
          started.set(query.queryHash, performance.now());
          break;
        case 'success': {
          if (action.manual) break;
          const begun = started.get(query.queryHash);
          started.delete(query.queryHash);
          emit({
            kind: 'query-read',
            key: query.queryKey,
            docs: count(action.data),
            ms: begun === undefined ? undefined : performance.now() - begun,
          });
          break;
        }
        case 'failed':
          emit({
            kind: 'query-retry',
            key: query.queryKey,
            attempt: action.failureCount,
          });
          break;
        case 'error':
          started.delete(query.queryHash);
          if (!isCancelledError(action.error)) {
            emit({
              kind: 'query-failed',
              key: query.queryKey,
              error: action.error,
            });
          }
          break;
      }
    });
  }, [client]);
}

/** A line for each page the visitor goes to: its path, without a query string or a hash. */
function useRouteLog() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (last.current === pathname) return;
    last.current = pathname;
    emit({ kind: 'route', path: pathname });
  }, [pathname]);
}

/** A line when `value` changes (not for the value it had when the shell mounted). */
function useChangeLog(name: SettingName, value: string) {
  const last = useRef(value);
  useEffect(() => {
    if (last.current === value) return;
    last.current = value;
    emit({ kind: 'setting', name, value });
  }, [name, value]);
}

/** A line each time `open` turns on. */
function useOpenLog(open: boolean, action: UiAction) {
  const was = useRef(open);
  useEffect(() => {
    if (open && !was.current) emit({ kind: 'ui', action });
    was.current = open;
  }, [open, action]);
}

/**
 * Feeds the dev log (the Output and Problems tabs) from what really happens in the page. It writes only through typed events (see
 * `events.ts`), so it cannot put a document, a field, a typed text or a URL in the log.
 * Mount it before the page in the tree: effects run in order, so it is listening before the page's queries start.
 */
export function useLogSources({ connectOpen }: { connectOpen: boolean }) {
  const { lang } = useLang();
  const { theme } = useTheme();
  const { isOpen: chatOpen } = useChat();
  usePageLog();
  useQueryLog();
  useRouteLog();
  useChangeLog('language', lang);
  useChangeLog('theme', theme);
  useOpenLog(connectOpen, 'connect opened');
  useOpenLog(chatOpen, 'chat opened');
}
