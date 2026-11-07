/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { useEffect, useRef, useState } from 'react';

/** Becomes `true` the first time the element is on screen and stays so: a block that plays an animation once, when it is seen. */
export function useInViewOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [seen]);
  return [ref, seen] as const;
}
