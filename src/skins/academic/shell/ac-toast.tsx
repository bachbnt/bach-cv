/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from '@/lib/utils';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';

/** A short message on a paper slip at the foot of the board (`Number copied`), read out politely. */
export function AcToast() {
  const { toast } = useAcOverlays();
  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'ac-paper pointer-events-none fixed bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-[2px] px-[18px] py-2 font-ac-note text-[18px] opacity-0 transition-opacity',
        toast.visible && 'opacity-100',
      )}
    >
      {toast.message}
    </div>
  );
}
