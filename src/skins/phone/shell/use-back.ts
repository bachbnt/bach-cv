/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef } from 'react';
import type { PageKey } from '@/lib/content/schema';

/**
 * "Back" of the system gesture: the page before this one if the visitor came to it from another page of the skin, the home screen
 * otherwise (a page opened by its address has nothing to go back to, and the browser's own history may lead off the site). The skin keeps
 * count of the pages it has been through since it was opened.
 */
export function useBack(page: PageKey | null): () => void {
  const router = useRouter();
  const trail = useRef(0);
  const going = useRef(false);
  const seen = useRef<PageKey | null | undefined>(undefined);
  useEffect(() => {
    // the first page is where the count starts; every later change is a step forward, or one back that `back` has announced
    if (seen.current !== undefined && seen.current !== page)
      trail.current = Math.max(0, trail.current + (going.current ? -1 : 1));
    going.current = false;
    seen.current = page;
  }, [page]);
  return useCallback(() => {
    if (trail.current > 0) {
      going.current = true;
      router.back();
    } else router.push('/');
  }, [router]);
}
