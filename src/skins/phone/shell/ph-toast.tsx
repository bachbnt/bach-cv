/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';

/**
 * A notification banner (`Number copied`) that slides in from the top, under the camera and the status bar, and goes again. It says what the
 * visitor just did, nothing more. It is centred under the camera (the middle of the screen, the middle of the right half of an open device),
 * a live region that is always there and read out politely, and the pointer goes through it. Only `translate` and `opacity` change; with
 * reduced motion it only fades (`phone.css`).
 */
export function PhToast({ hinge }: { hinge: boolean }) {
  const { toast } = usePhOverlays();
  return (
    <div
      role='status'
      aria-live='polite'
      className={cn(
        'ph-toast pointer-events-none fixed top-[calc(3.25rem+env(safe-area-inset-top,0px))] z-[70] flex w-max max-w-[calc(100%-1.5rem)] -translate-x-1/2 items-center gap-3 rounded-ph-panel bg-ph-sheet-2 py-2.5 pr-5 pl-3 text-[14px] font-semibold text-ph-ink opacity-0 shadow-ph-float ring-1 ring-ph-line transition-[translate,opacity] duration-[280ms] ease-ph-out',
        hinge ? 'left-[calc(100%-17.5rem)]' : 'left-1/2',
        toast.visible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-[180%] opacity-0',
      )}
    >
      {toast.message && (
        <>
          <span
            aria-hidden='true'
            className='grid size-7 shrink-0 place-items-center rounded-full bg-ph-ok text-ph-sheet'
          >
            <Check className='size-4' strokeWidth={3} />
          </span>
          <span className='min-w-0'>{toast.message}</span>
        </>
      )}
    </div>
  );
}
