/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

/** A one-line hint of what the active tool wants next. It is polite live text, so a screen reader hears it too. */
export function HintPill({ text, top }: { text: string; top: number }) {
  return (
    <p
      role='status'
      data-testid='tv-hint'
      style={{ top: top + 8 }}
      className='tv-chart-rise pointer-events-none absolute left-1/2 z-[4] max-w-[calc(100%-24px)] -translate-x-1/2 rounded-md bg-tv-tip px-2.5 py-1 text-center text-xs text-white shadow-tv-menu'
    >
      {text}
    </p>
  );
}
