/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { devCopy } from '@/content/copy/dev';

type Hints = (typeof devCopy)['en']['hints'];

/** `4 roles`: the note that appears beside a section heading when the pointer is over it. It counts real items, never invents text. */
export function countHint(
  hints: Hints,
  key: keyof Hints,
  count: number,
): string {
  return (count === 1 ? hints[key].one : hints[key].other).replace(
    '{n}',
    String(count),
  );
}
