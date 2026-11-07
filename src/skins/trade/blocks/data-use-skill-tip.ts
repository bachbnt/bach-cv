/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ActiveTip } from '@/components/skills/skill-tip';

/**
 * The one tip of a section of skill chips (the Standard `SkillChip` and `SkillTip`): a tap outside, Escape, a scroll or a resize
 * closes it. Returns the tip, how to set it and how to hide it.
 */
export function useSkillTip() {
  const [tip, setTip] = useState<ActiveTip | null>(null);
  const hide = useCallback(() => setTip(null), []);

  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-skill-chip]')) hide();
    };
    addEventListener('keydown', onKey);
    addEventListener('scroll', hide, { passive: true, capture: true });
    addEventListener('resize', hide);
    document.addEventListener('click', onClick);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', hide, { capture: true });
      removeEventListener('resize', hide);
      document.removeEventListener('click', onClick);
    };
  }, [tip, hide]);

  return { tip, setTip, hide };
}
