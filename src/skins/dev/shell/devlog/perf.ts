/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { emit } from '@/skins/dev/shell/devlog/store';

/** How long after the page is ready its numbers are taken, when the visitor has not touched it before then. */
const SETTLE_MS = 3000;

type Handler = (entries: PerformanceEntryList) => void;

let ttfbDone = false;
let vitalsDone = false;

/** The browser's own numbers; no library. */
function supports(type: string): boolean {
  try {
    return (
      typeof PerformanceObserver !== 'undefined' &&
      (PerformanceObserver.supportedEntryTypes ?? []).includes(type)
    );
  } catch {
    return false;
  }
}

/** Time to first byte of this page load, once. */
function logTtfb(): void {
  if (ttfbDone) return;
  ttfbDone = true;
  try {
    const [navigation] = performance.getEntriesByType('navigation');
    const start = (navigation as PerformanceNavigationTiming | undefined)
      ?.responseStart;
    if (typeof start === 'number' && start > 0)
      emit({ kind: 'ttfb', ms: start });
  } catch {
    // the Performance API is not there: no line
  }
}

/**
 * Logs `TTFB` now and, once the page has settled (first key or tap, the tab hidden, or a few seconds), its Largest Contentful Paint
 * and Cumulative Layout Shift. Both are read with a `PerformanceObserver` and logged once per page load. Returns what stops the
 * watching.
 */
export function startPerfLog(): () => void {
  logTtfb();
  if (vitalsDone) return () => {};
  const lcp = supports('largest-contentful-paint');
  const shifts = supports('layout-shift');
  if (!lcp && !shifts) {
    vitalsDone = true;
    return () => {};
  }

  let lcpMs: number | undefined;
  let cls = 0;
  const observers: { observer: PerformanceObserver; handle: Handler }[] = [];
  const observe = (type: string, handle: Handler) => {
    try {
      const observer = new PerformanceObserver((list) =>
        handle(list.getEntries()),
      );
      observer.observe({ type, buffered: true });
      observers.push({ observer, handle });
    } catch {
      // not supported with these options: that number is left out
    }
  };
  if (lcp) {
    observe('largest-contentful-paint', (entries) => {
      const last = entries.at(-1);
      if (last) lcpMs = last.startTime;
    });
  }
  if (shifts) {
    observe('layout-shift', (entries) => {
      for (const entry of entries) {
        const shift = entry as PerformanceEntry & {
          value?: number;
          hadRecentInput?: boolean;
        };
        if (!shift.hadRecentInput && typeof shift.value === 'number') {
          cls += shift.value;
        }
      }
    });
  }

  const stop = () => {
    clearTimeout(timer);
    observers.forEach(({ observer }) => observer.disconnect());
    document.removeEventListener('visibilitychange', onHidden);
    window.removeEventListener('keydown', settle, true);
    window.removeEventListener('pointerdown', settle, true);
  };
  const settle = () => {
    if (vitalsDone) return;
    vitalsDone = true;
    // the observers have delivered what is buffered by now
    observers.forEach(({ observer, handle }) => handle(observer.takeRecords()));
    stop();
    emit({
      kind: 'vitals',
      lcpMs,
      cls: shifts ? cls : undefined,
    });
  };
  const onHidden = () => {
    if (document.visibilityState === 'hidden') settle();
  };
  const timer = setTimeout(settle, SETTLE_MS);
  document.addEventListener('visibilitychange', onHidden);
  window.addEventListener('keydown', settle, { capture: true, once: true });
  window.addEventListener('pointerdown', settle, { capture: true, once: true });
  return stop;
}
