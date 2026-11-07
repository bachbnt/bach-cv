/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';

/** Becomes true when `value` first is and stays true: a window is loaded when first opened and kept so it can animate out. */
export function useOnceTrue(value: boolean): boolean {
  const [seen, setSeen] = useState(value);
  if (value && !seen) setSeen(true);
  return seen;
}
