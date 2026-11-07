/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { cn } from '@/lib/utils';
import { useOverlays } from '@/skins/moba/shell/overlay-context';

/** A short message above the champion bar (`Copied`). It is a polite live region, and the same message twice is read twice. */
export function Toast() {
  const { toast } = useOverlays();
  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'mb-card pointer-events-none absolute bottom-[196px] left-1/2 z-[95] -translate-x-1/2 px-4 py-2 text-[13px] font-bold tracking-wide text-mb-title transition duration-200 max-[719px]:bottom-[170px]',
        toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0',
      )}
    >
      {toast.message}
    </div>
  );
}
