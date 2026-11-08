/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { useInViewOnce } from '@/skins/trade/blocks/desk-use-in-view';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/**
 * Education as the corporate actions of a symbol: a dated timeline with the degree, the school, the period and the major. The rows slide in one
 * after another the first time the list is seen.
 */
export function DeskAboutTimeline() {
  const copy = useCopy(tradeDeskCopy).about;
  const title = useCopy(resumeCopy).education.title;
  const { lang } = useLang();
  const reduced = useReducedMotion();
  const [ref, seen] = useInViewOnce<HTMLOListElement>();
  const query = useContentQuery('education');
  const degrees = query.data ?? [];
  const shown = seen || reduced;

  return (
    <DeskSection id='tv-edu' title={title} kicker={copy.timeline.kicker}>
      <TvDataState
        query={query}
        count={degrees.length}
        empty='education'
        subject='education'
        level={3}
        skeleton={
          <div className='grid gap-2'>
            <TvSkeleton className='h-14' />
            <TvSkeleton className='h-14' />
          </div>
        }
      >
        <ol
          ref={ref}
          className='m-0 ml-1.5 list-none border-l border-tv-line p-0'
        >
          {degrees.map((degree, i) => (
            <li
              key={degree.id}
              style={{ animationDelay: `${i * 110}ms` }}
              className={cn(
                'relative pb-4 pl-4 last:pb-0',
                shown ? 'animate-tv-slide-in-slow' : 'opacity-0',
              )}
            >
              <span
                aria-hidden='true'
                className='absolute top-1 -left-[5.5px] size-2.5 rounded-full border-2 border-tv-accent bg-tv-panel'
              />
              <p className='text-xs text-tv-mute tabular-nums'>
                {formatPeriod(degree.startMonth, degree.endMonth, lang)}
              </p>
              <h3 className='mt-0.5 text-[13px]/snug font-semibold'>
                {degree.degree}
              </h3>
              <p className='text-xs text-tv-mute'>{degree.school}</p>
              {degree.major && (
                <p className='mt-0.5 text-xs'>
                  <span className='text-tv-mute'>{copy.timeline.major}: </span>
                  {degree.major}
                </p>
              )}
            </li>
          ))}
        </ol>
      </TvDataState>
    </DeskSection>
  );
}
