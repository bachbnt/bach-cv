/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { phoneCopy } from '@/content/copy/phone';
import { useCopy } from '@/lib/i18n/copy';
import { isUpDrag } from '@/skins/phone/shell/gestures';

/**
 * The bar at the foot of an app, an overlay with no height (the page scrolls under it; under the right half of an open device, away from the crease): the pill that takes you to the home screen, by a tap or by a drag up (with a finger or the mouse), as on a
 * phone. It stays at the foot while the page scrolls: sticky in a window (the document scrolls), and in a device ABSOLUTE at the foot of the screen, which does not scroll: a sticky box would be pulled up by the window
 * (its scrolling box) whenever the scaled device is taller than the window, since the layout is not scaled.
 */
export function HomeBar() {
  const copy = useCopy(phoneCopy);
  const router = useRouter();
  const from = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  return (
    <div className='pointer-events-none sticky bottom-0 z-30 h-0 shrink-0 group-data-[mode=device]/ph:absolute group-data-[mode=device]/ph:inset-x-0'>
      <div className='absolute inset-x-0 bottom-0 flex h-[calc(2.25rem+env(safe-area-inset-bottom,0px))] items-start pointer-coarse:h-[calc(2.75rem+env(safe-area-inset-bottom,0px))] justify-center bg-linear-to-t from-ph-sheet/80 to-transparent group-data-[hinge]/ph:justify-start group-data-[hinge]/ph:pl-[calc(75%-5rem)]'>
        <Link
          href='/'
          aria-label={copy.goHome}
          // a link is dragged as a link by the mouse, which would end the pointer events of the drag up
          draggable={false}
          onPointerDown={(event) => {
            from.current = { x: event.clientX, y: event.clientY };
            dragged.current = false;
            // the finger or the mouse leaves the bar as it drags up; the capture keeps the end of the drag here
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => {
            const start = from.current;
            from.current = null;
            if (
              start &&
              isUpDrag(event.clientX - start.x, event.clientY - start.y)
            ) {
              dragged.current = true;
              router.push('/');
            }
          }}
          onPointerCancel={() => {
            from.current = null;
          }}
          onClick={(event) => {
            // the drag has already gone home; the click that ends it must not go there a second time
            if (dragged.current) event.preventDefault();
            dragged.current = false;
          }}
          className='pointer-events-auto grid h-9 w-40 touch-none place-items-center pointer-coarse:h-11'
        >
          <span
            aria-hidden='true'
            className='block h-[5px] w-32 rounded-full bg-ph-ink/60'
          />
        </Link>
      </div>
    </div>
  );
}
