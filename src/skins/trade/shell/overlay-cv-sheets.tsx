/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type UIEvent,
} from 'react';
import { buildBlocks, type CvBlock } from '@/components/cv/build-blocks';
import { CvSkeleton } from '@/components/cv/cv-skeleton';
import { cvCopy, pageLabel } from '@/content/copy/cv';
import type { CvModel } from '@/lib/cv/build-cv';
import { paginate } from '@/lib/cv/paginate';
import {
  CONTENT_HEIGHT,
  CONTENT_WIDTH,
  SHEET_HEIGHT,
  SHEET_WIDTH,
} from '@/lib/cv/sheet';
import { useCopy } from '@/lib/i18n/copy';

const GAP = 24;
const PAD = 16;

/** The zoom steps, as a share of the size that fits the width of the window. */
export const CV_ZOOMS = [0.75, 1, 1.25, 1.5, 2] as const;

/**
 * The CV as A4 sheets on a dark desk, made of the parts of the Standard preview (`buildBlocks`, `paginate`): the blocks are measured
 * once off screen, packed into pages and only then shown. The sheets are white in both themes. `step` zooms them (1 fits the width),
 * and the page that is in view and the number of pages are told to the toolbar.
 */
export function TvCvSheets({
  cv,
  step,
  onPages,
  onPage,
}: {
  cv: CvModel;
  /** an index of `CV_ZOOMS` */
  step: number;
  onPages: (total: number) => void;
  onPage: (page: number) => void;
}) {
  const copy = useCopy(cvCopy);
  const blocks = useMemo(() => buildBlocks(cv, copy), [cv, copy]);
  const deskRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState(1);
  const [measured, setMeasured] = useState<{
    blocks: CvBlock[];
    pages: number[][];
  } | null>(null);
  const pages = measured?.blocks === blocks ? measured.pages : null;
  const zoom = fit * CV_ZOOMS[step];

  useLayoutEffect(() => {
    const desk = deskRef.current;
    if (!desk) return;
    const update = () =>
      setFit(Math.min(1, (desk.clientWidth - 2 * PAD) / SHEET_WIDTH));
    update();
    const observer = new ResizeObserver(update);
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

  const total = pages?.length ?? 0;
  useEffect(() => {
    onPages(total);
  }, [total, onPages]);

  // the page whose upper third is in view is "the page"; the sheets are one height, so the position gives it
  const onScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!total) return;
    const desk = event.currentTarget;
    const pitch = SHEET_HEIGHT * zoom + GAP;
    const probe = desk.scrollTop + desk.clientHeight / 3 - PAD;
    onPage(Math.min(total, Math.max(1, Math.floor(probe / pitch) + 1)));
  };

  return (
    <div
      ref={deskRef}
      role='region'
      aria-label={copy.previewLabel}
      tabIndex={0}
      onScroll={onScroll}
      className='relative min-h-0 flex-1 overflow-auto bg-tv-hover outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tv-accent'
    >
      {pages ? (
        <div
          style={{ padding: PAD, gap: GAP }}
          className='mx-auto flex w-max flex-col'
        >
          {pages.map((page, n) => (
            <section
              key={n}
              aria-label={pageLabel(copy, n + 1, pages.length)}
              style={{ zoom }}
              className='theme-light box-border h-[1123px] w-[794px] flex-none overflow-hidden bg-card px-[46px] py-10 text-[11px] leading-[1.4] text-foreground shadow-tv-paper'
            >
              {page.map((index) => (
                <div key={blocks[index].key}>{blocks[index].node}</div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <>
          <div className='flex min-h-full p-4'>
            <CvSkeleton />
          </div>
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
