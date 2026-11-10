/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, ViewTransition, type ReactNode } from 'react';
import { academicCopy } from '@/content/copy/academic';
import type { PageKey } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { Footer } from '@/skins/academic/shell/footer';
import { EraserWipe } from '@/skins/academic/shell/eraser-wipe';
import { Header } from '@/skins/academic/shell/header';
import { Ledge } from '@/skins/academic/shell/ledge';
import { AcOverlays } from '@/skins/academic/shell/overlays';
import { AcOverlayProvider } from '@/skins/academic/shell/overlay-context';
import { Pager } from '@/skins/academic/shell/pager';
import { Toc } from '@/skins/academic/shell/toc';
import {
  useEraserWipe,
  WipeCaptureContext,
} from '@/skins/academic/shell/use-eraser-wipe';
import { AcRoot } from '@/skins/academic/ui/ac-root';

/**
 * The frame of the Academic skin: a board in a frame with the header and the contents on top, the page in the middle with its margin ruled on the
 * right, the turn of the page at the foot, and the ledge below. The chat, viewer and CV sheet lie over it.
 */
export function AcademicShell({
  page,
  children,
}: {
  page: PageKey | null;
  children: ReactNode;
}) {
  const current: PageKey = page ?? 'home';
  const copy = useCopy(academicCopy);
  // the eraser that wipes one page off the board and shows the next (see `use-eraser-wipe.ts`)
  const pageRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<HTMLDivElement>(null);
  const captureWipe = useEraserWipe(current, pageRef, wipeRef);
  return (
    <AcOverlayProvider>
      <WipeCaptureContext value={captureWipe}>
        <AcRoot>
          <header>
            <Header />
            <Toc page={current} />
          </header>
          <div className='mx-auto mt-4 max-w-[1120px] px-5 pb-6 max-[760px]:mt-2 max-[760px]:px-2.5'>
            <main
              id='ac-main'
              tabIndex={-1}
              className='relative min-h-[70vh] px-0 pt-7 pb-6 outline-none min-[761px]:pt-12 min-[761px]:pr-[50px] min-[761px]:pl-[78px]'
            >
              <p
                aria-hidden='true'
                className='absolute top-14 left-[26px] hidden rotate-180 font-ac-note text-[15px] tracking-[0.1em] whitespace-nowrap text-ac-mute opacity-70 [writing-mode:vertical-rl] min-[1100px]:block'
              >
                {copy.spine}
              </p>
              {/* a page change that was not wiped by the eraser fades (classes in academic.css) */}
              <ViewTransition
                key={current}
                enter='ac-vt-in'
                exit='ac-vt-out'
                default='none'
              >
                <div
                  ref={pageRef}
                  className='relative min-[900px]:before:pointer-events-none min-[900px]:before:absolute min-[900px]:before:top-0 min-[900px]:before:bottom-0 min-[900px]:before:left-[calc(100%-262px-12px)] min-[900px]:before:w-0.5 min-[900px]:before:bg-[repeating-linear-gradient(to_bottom,var(--ac-faint)_0_12px,transparent_12px_19px)] min-[900px]:before:content-[""]'
                >
                  {children}
                </div>
              </ViewTransition>
              <Pager page={current} />
            </main>
          </div>
          <Footer />
          <Ledge />
          <EraserWipe ref={wipeRef} />
          <AcOverlays />
        </AcRoot>
      </WipeCaptureContext>
    </AcOverlayProvider>
  );
}
