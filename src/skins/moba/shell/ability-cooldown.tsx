/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useFx } from '@/skins/moba/shell/fx-context';

/** Seconds left, rounded up, so the number never says 0 while the slot is still dark. */
const secondsLeft = (until: number): number =>
  Math.max(1, Math.ceil((until - performance.now()) / 1000));

/** The dark wipe over a slot that was just cast, and the seconds until it can be cast again. It is decoration: the slot keeps its name. */
export function AbilityCooldown({ slot }: { slot: number }) {
  const entry = useFx().cooling[slot];
  const until = entry?.until;
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (until === undefined) return;
    const tick = () => setLeft(secondsLeft(until));
    tick();
    const timer = setInterval(tick, 250);
    return () => clearInterval(timer);
  }, [until]);
  if (!entry) return null;
  return (
    <span
      key={entry.until}
      aria-hidden='true'
      className='mb-cd absolute inset-[2px] z-[3] grid place-items-center'
      style={{ '--cd': `${entry.ms}ms` } as CSSProperties}
    >
      <span className='font-mb-display text-lg font-bold text-mb-title'>
        {left}
      </span>
    </span>
  );
}
