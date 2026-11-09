/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useState } from 'react';

/** Becomes true when `value` first is, and stays true: a window that was opened once stays mounted (its closing animation, its state). */
export function useOnceTrue(value: boolean): boolean {
  const [seen, setSeen] = useState(value);
  if (value && !seen) setSeen(true);
  return seen || value;
}
