/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect } from 'react';

/**
 * Scrolls to the element the address ends in (`/resume#skills`) once the blocks above it are ready. The browser makes its own jump
 * when the page opens, but the blocks above are skeletons then and grow when their data arrives, which pushes the target down and
 * leaves the visitor above it. Pass `true` when every block above the target has its data.
 */
export function useScrollToHash(ready: boolean) {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (ready && id) document.getElementById(id)?.scrollIntoView();
  }, [ready]);
}
