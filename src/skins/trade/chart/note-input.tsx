/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { tradeChartCopy } from '@/content/copy/trade-chart';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';

/** The box for a text note, where the visitor clicked. Enter keeps the note, Escape drops it, and leaving the box keeps what was written. */
export function NoteInput({
  x,
  y,
  onDone,
}: {
  x: number;
  y: number;
  onDone: (text: string | null) => void;
}) {
  const copy = useCopy(tradeChartCopy).tools;
  const input = useRef<HTMLInputElement>(null);
  const settled = useRef(false);
  useEffect(() => {
    input.current?.focus();
  }, []);
  const finish = (text: string | null) => {
    if (settled.current) return;
    settled.current = true;
    onDone(text);
  };
  return (
    <input
      ref={input}
      type='text'
      maxLength={80}
      aria-label={copy.noteLabel}
      placeholder={copy.notePlaceholder}
      style={{ left: x, top: y - 28 }}
      className={cn(
        TV_FIELD,
        'absolute z-[6] h-7 w-44 border-tv-accent px-2 text-xs shadow-tv-menu pointer-coarse:h-9',
      )}
      onKeyDown={(event) => {
        event.stopPropagation();
        if (event.key === 'Enter')
          finish(event.currentTarget.value.trim() || null);
        if (event.key === 'Escape') finish(null);
      }}
      onBlur={(event) => finish(event.currentTarget.value.trim() || null)}
    />
  );
}
