/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { hasFinePointer } from '@/lib/chat/fine-pointer';

/** The small key of the browser that remembers the hint was seen (a UI preference, nothing personal). */
const SEEN_KEY = 'bach-cv-travel-hint';
const STAY_MS = 12_000;

let gone = false;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => void listeners.delete(listener);
};
const remembered = (): boolean => {
  try {
    return localStorage.getItem(SEEN_KEY) === 'seen';
  } catch {
    // the storage can be closed: the hint is then shown, and gone with the page
    return false;
  }
};
/** The hint is not shown any more in this page; with `remember`, not on the next visits either. */
function dismiss(remember: boolean) {
  gone = true;
  if (remember) {
    try {
      localStorage.setItem(SEEN_KEY, 'seen');
    } catch {
      // see `remembered`
    }
  }
  listeners.forEach((listener) => listener());
}

/**
 * A line over the map that says how to see a stop, since the cards of the stops are only shown for the open one or the pin that is pointed
 * at. It goes once a pin has been pointed at, focused or pressed (and stays gone on the next visits), or after a while.
 */
export function MapHint({
  text,
  touchText,
}: {
  text: string;
  touchText: string;
}) {
  const shown = useSyncExternalStore(
    subscribe,
    () => !gone && !remembered(),
    () => false,
  );
  useEffect(() => {
    if (!shown) return;
    const onPin = (event: Event) => {
      if (
        event.target instanceof Element &&
        event.target.closest('.tl-pin-btn')
      )
        dismiss(true);
    };
    const timer = window.setTimeout(() => dismiss(false), STAY_MS);
    document.addEventListener('pointerover', onPin);
    document.addEventListener('focusin', onPin);
    document.addEventListener('click', onPin);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerover', onPin);
      document.removeEventListener('focusin', onPin);
      document.removeEventListener('click', onPin);
    };
  }, [shown]);
  if (!shown) return null;
  return (
    <p aria-hidden='true' className='tl-hint'>
      {hasFinePointer() ? text : touchText}
    </p>
  );
}
