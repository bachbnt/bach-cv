/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useState } from 'react';

/**
 * How many times `value` has gone up since the first render (0 until it does). Use it as the `key` of what should nudge when a count
 * grows, and play the nudge only when it is above 0, so nothing moves on load or when the count goes down.
 */
export function useBumps(value: number): number {
  const [seen, setSeen] = useState(value);
  const [bumps, setBumps] = useState(0);
  // adjusting state while rendering (React's way to follow a changing prop without an effect)
  if (value !== seen) {
    setSeen(value);
    if (value > seen) setBumps((n) => n + 1);
  }
  return bumps;
}
