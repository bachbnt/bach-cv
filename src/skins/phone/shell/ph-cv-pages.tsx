/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cvCopy, pageLabel } from '@/content/copy/cv';
import { useCopy } from '@/lib/i18n/copy';

/**
 * The CV as a document viewer: the sheets of `CvSheets` (the same component as Standard, which packs the CV into A4 pages and knows nothing
 * of this overlay) with the name of the page on view floating at the foot, `Page 1 of 2`, like a PDF reader's. Nothing is invented: the
 * count is the number of sheets that are on screen and the current one is the sheet that shows most, both read from them. Nothing is
 * shown until the sheets have been laid out.
 */
export function PhCvPages({ children }: { children: ReactNode }) {
  const copy = useCopy(cvCopy);
  const host = useRef<HTMLDivElement>(null);
  const [view, setView] = useState({ page: 1, total: 0 });

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let watcher: IntersectionObserver | undefined;

    const watch = () => {
      watcher?.disconnect();
      const desk = element.querySelector('[role=region]');
      const sheets = Array.from(
        element.querySelectorAll('[role=region] > section'),
      );
      setView((v) => ({
        page: Math.min(v.page, Math.max(sheets.length, 1)),
        total: sheets.length,
      }));
      if (!desk || sheets.length === 0) return;
      const shown = new Map<Element, number>();
      watcher = new IntersectionObserver(
        (entries) => {
          for (const entry of entries)
            shown.set(entry.target, entry.intersectionRect.height);
          let best = 0;
          sheets.forEach((sheet, i) => {
            if ((shown.get(sheet) ?? 0) > (shown.get(sheets[best]) ?? 0))
              best = i;
          });
          setView((v) => (v.page === best + 1 ? v : { ...v, page: best + 1 }));
        },
        { root: desk, threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
      );
      for (const sheet of sheets) watcher.observe(sheet);
    };

    const mutations = new MutationObserver(watch);
    mutations.observe(element, { childList: true, subtree: true });
    watch();
    return () => {
      mutations.disconnect();
      watcher?.disconnect();
    };
  }, []);

  return (
    <div ref={host} className='relative flex min-h-0 flex-1 flex-col'>
      {children}
      {view.total > 0 && (
        <span
          data-slot='ph-cv-page'
          className='pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-ph-sheet-3 px-3.5 py-1.5 text-[13px] font-semibold text-ph-ink tabular-nums shadow-ph-card'
        >
          {pageLabel(copy, view.page, view.total)}
        </span>
      )}
    </div>
  );
}
