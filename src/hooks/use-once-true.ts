/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useState } from 'react';

/** Stays `true` once `flag` has been `true`: a window is loaded when it is first opened and kept mounted after that. */
export function useOnceTrue(flag: boolean): boolean {
  const [seen, setSeen] = useState(flag);
  if (flag && !seen) setSeen(true);
  return seen || flag;
}
