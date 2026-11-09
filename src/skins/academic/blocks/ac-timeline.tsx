/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useMemo, type CSSProperties } from 'react';
import { academicHomeAboutCopy } from '@/content/copy/academic-home-about';
import { statesCopy } from '@/content/copy/states';
import { useNow } from '@/hooks/use-now';
import { fill } from '@/lib/chat/fill';
import { timelineRows, timelineYears } from '@/lib/derive/career-timeline';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import {
  axisYears,
  barKind,
  placeBar,
} from '@/skins/academic/blocks/ac-timeline-model';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import '@/skins/academic/css/home-about.css';

/**
 * Figure 1: the roles and the studies on one line of time, each a bar shaded by hand (a hatched one for a full-time role, a dashed one for any
 * other, a dotted one for a degree, an arrow on what is not over). It is the data of the Resume page laid out in time, so a row leads there. If the
 * roles or the degrees cannot be read, the figure is left out: it is an extra, as the featured projects are.
 */
export function AcTimeline() {
  const mine = useCopy(academicHomeAboutCopy).home;
  const states = useCopy(statesCopy);
  const { lang } = useLang();
  const now = useNow();
  const jobsQuery = useContentQuery('experience');
  const degreesQuery = useContentQuery('education');
  const rows = useMemo(
    () => timelineRows(jobsQuery.data ?? [], degreesQuery.data ?? []),
    [jobsQuery.data, degreesQuery.data],
  );
  const years = timelineYears(rows, now);

  if (jobsQuery.isPending || degreesQuery.isPending) {
    return (
      <div role='status' aria-busy='true' aria-label={states.loading}>
        <AcSkeleton className='h-[300px]' />
      </div>
    );
  }
  if (jobsQuery.isError || degreesQuery.isError || !years) return null;

  const span = years.to - years.from + 1;
  const marks = axisYears(years);
  return (
    <figure className='m-0'>
      <div className='border-y-2 border-dashed border-ac-rule pt-4 pb-3'>
        <ol
          aria-label={mine.figure.axis}
          className='relative m-0 list-none p-0 [--lw:200px]'
          style={{ '--yrs': span } as CSSProperties}
        >
          <li
            aria-hidden='true'
            className='grid grid-cols-[var(--lw)_1fr] items-center max-[760px]:hidden'
          >
            <span />
            <span className='relative block h-7'>
              {marks.map((mark) => (
                <span
                  key={mark.year}
                  style={{ left: `${mark.left}%` }}
                  className='ac-tl-tick absolute top-0 -translate-x-1/2 font-ac-note text-[16px]/[1.2] text-ac-mute'
                >
                  {mark.year}
                </span>
              ))}
            </span>
          </li>
          <li aria-hidden='true' className='ac-tl-grid'>
            {marks.map((mark) => (
              <span
                key={mark.year}
                className='ac-tl-gl'
                style={{ left: `${mark.left}%` }}
              />
            ))}
          </li>
          {rows.map((row) => {
            const bar = placeBar(row, years, now);
            const kind = barKind(row.kind);
            const period = formatPeriod(row.startMonth, row.endMonth, lang);
            return (
              <li
                key={`${row.kind}-${row.id}`}
                className='ac-tl-row relative grid grid-cols-1 items-center after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:border-b-[1.6px] after:border-dashed after:border-ac-faint after:content-[""] last:after:hidden has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-ac-accent has-[a:focus-visible]:outline-dashed min-[761px]:grid-cols-[var(--lw)_1fr]'
              >
                <Link
                  href='/resume'
                  className='contents no-underline outline-none'
                >
                  <span className='block py-2 pr-3.5 text-[0.84em]/[1.15]'>
                    <b className='block font-semibold'>{row.title}</b>
                    <i className='text-ac-mute'>{row.subtitle}</i>
                    <span className='sr-only'>, {period}</span>
                  </span>
                  <span
                    aria-hidden='true'
                    className='ac-bar-row relative block h-[38px]'
                  >
                    <span
                      className={cn(
                        'ac-bar',
                        `ac-bar-${kind}`,
                        row.current && 'ac-bar-ongoing',
                      )}
                      style={{ left: `${bar.left}%`, width: `${bar.width}%` }}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
      <figcaption className='mt-3.5 max-w-[64ch] text-[0.88em]/[1.45]'>
        <b className='mr-1 font-ac-note text-[1.12em] font-normal text-ac-md'>
          {mine.figure.label}
        </b>
        {fill(mine.figure.title, { from: years.from, to: years.to })}{' '}
        {mine.figure.legend} {mine.figure.open}
      </figcaption>
    </figure>
  );
}
