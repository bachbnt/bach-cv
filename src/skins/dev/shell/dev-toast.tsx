/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from '@/lib/utils';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';

/** The short message at the bottom of the window (`Number copied`). It is a live region, so it is read out. */
export function DevToast() {
  const { toast } = useDevOverlays();
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-12 left-1/2 z-[110] rounded-[4px] border border-signal bg-chrome px-4 py-2.5 font-sans text-[13.5px] leading-[normal] text-head opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-[opacity,translate] duration-[250ms] [translate:-50%_20px]',
        toast.visible && 'opacity-100 [translate:-50%_0]',
      )}
      role='status'
      aria-live='polite'
    >
      {toast.message}
    </div>
  );
}
