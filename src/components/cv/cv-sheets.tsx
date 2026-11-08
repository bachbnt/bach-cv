/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { buildBlocks, type CvBlock } from '@/components/cv/build-blocks';
import { CvSkeleton } from '@/components/cv/cv-skeleton';
import { cvCopy, pageLabel } from '@/content/copy/cv';
import type { CvModel } from '@/lib/cv/build-cv';
import { useCopy } from '@/lib/i18n/copy';
import { paginate } from '@/lib/cv/paginate';
import { CONTENT_HEIGHT, CONTENT_WIDTH, SHEET_WIDTH } from '@/lib/cv/sheet';

/**
 * The CV as A4 sheets on a grey desk. The blocks are measured once off screen (after the fonts load),
 * packed into pages, and only then shown, so the sheets are never re-flowed in front of the reader.
 * On a phone the sheets are scaled down to the width of the screen with `zoom`.
 */
export function CvSheets({ cv }: { cv: CvModel }) {
  const copy = useCopy(cvCopy);
  const blocks = useMemo(() => buildBlocks(cv, copy), [cv, copy]);
  const deskRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [measured, setMeasured] = useState<{
    blocks: CvBlock[];
    pages: number[][];
  } | null>(null);
  const pages = measured?.blocks === blocks ? measured.pages : null;

  useLayoutEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    const fit = () =>
      setZoom(Math.min(1, (desk.clientWidth - 16) / SHEET_WIDTH));
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(desk);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      const root = measureRef.current;
      if (cancelled || !root) return;
      const heights = Array.from(
        root.children,
        (el) => el.getBoundingClientRect().height,
      );
      setMeasured({
        blocks,
        pages: paginate(
          blocks.map((block, i) => ({
            height: heights[i] ?? 0,
            keepWithNext: block.keepWithNext,
          })),
          CONTENT_HEIGHT,
        ),
      });
    });
    return () => {
      cancelled = true;
    };
  }, [blocks]);

  return (
    <div
      ref={deskRef}
      role='region'
      aria-label={copy.previewLabel}
      tabIndex={0}
      className='relative flex min-h-0 flex-1 flex-col items-center gap-6 overflow-y-auto bg-paper py-8 max-[820px]:gap-3 max-[820px]:py-3'
    >
      {pages ? (
        pages.map((page, n) => (
          <section
            key={n}
            aria-label={pageLabel(copy, n + 1, pages.length)}
            style={{ zoom }}
            className='theme-light box-border h-[1123px] w-[794px] flex-none overflow-hidden bg-white px-[46px] py-10 text-[11px] leading-[1.4] text-[#1b1f27] shadow-[0_2px_12px_rgba(27,31,39,0.18)]'
          >
            {page.map((index) => (
              <div key={blocks[index].key}>{blocks[index].node}</div>
            ))}
          </section>
        ))
      ) : (
        <>
          <CvSkeleton />
          <div
            ref={measureRef}
            inert
            aria-hidden='true'
            style={{ width: CONTENT_WIDTH }}
            className='pointer-events-none invisible absolute top-0 left-0 text-[11px] leading-[1.4]'
          >
            {blocks.map((block) => (
              <div key={block.key} className='flow-root'>
                {block.node}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
