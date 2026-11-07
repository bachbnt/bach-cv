/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { KeyboardEvent } from 'react';

/**
 * Arrow Up and Down (and Home and End) move the focus between the rows of a list (the ones that carry `data-roving`): put it on the container's `onKeyDown`. Every row
 * stays a normal tab stop, so Tab and Enter work as they do anywhere; the arrows are the quick way down a long list.
 */
export function rovingKeys(event: KeyboardEvent<HTMLElement>): void {
  const { key } = event;
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return;
  const rows = [
    ...event.currentTarget.querySelectorAll<HTMLElement>('[data-roving]'),
  ];
  const at = rows.findIndex((row) => row === document.activeElement);
  if (at < 0) return;
  const to =
    key === 'Home'
      ? 0
      : key === 'End'
        ? rows.length - 1
        : at + (key === 'ArrowDown' ? 1 : -1);
  const row = rows[Math.min(rows.length - 1, Math.max(0, to))];
  event.preventDefault();
  row.focus();
}
