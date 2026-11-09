/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState, type CSSProperties } from 'react';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { tenureOf, type Tenure } from '@/lib/derive/career-months';
import { isCurrent } from '@/lib/derive/current-job';
import { formatDuration } from '@/lib/derive/duration-label';
import { careerSpan, spanYears } from '@/lib/derive/skill-use';
import { DataCurrentMark } from '@/skins/trade/blocks/data-current-mark';
import { DataSegmented } from '@/skins/trade/blocks/data-segmented';
import {
  barPlacement,
  monthsInYear,
} from '@/skins/trade/blocks/data-resume-model';
import { cssVars } from '@/skins/trade/ui/css-vars';

type Period = 'annual' | 'role';
type Job = Doc<'experience'>;

/** The width of the label column and the least width of a year: below the sum the grid scrolls inside its own box, never the page. */
const LABEL = 180;
const YEAR_MIN = 52;
const BY_ROLE_COLUMNS = `${LABEL}px 150px 120px minmax(140px,1fr)`;

const ROW =
  'grid h-12 items-stretch border-b border-tv-line bg-tv-bg transition-colors data-[hot=true]:bg-tv-hover';
const STICKY = 'sticky left-0 z-[2] min-w-0 border-r border-tv-line bg-inherit';
const GROW =
  'origin-left animate-tv-grow [animation-delay:calc(var(--i)*90ms)]';

/**
 * The jobs as a statement: a row for each role and a column for each year of the career, with a bar over the years the role ran.
 * By year, the bars sit on the calendar; by role, each bar is as long as the role lasted, against the longest. Hovering or focusing a
 * bar reads the company, role and dates in the line above (like the legend of a chart); a click opens the notes of the role.
 * The rows have one height and the label column one width (long names are cut and carry a `title`), the bars are clipped to their
 * cells, and the label column stays in view when a narrow panel scrolls the years.
 */
export function DataFinancials({
  jobs,
  now,
  activeId,
  onOpen,
}: {
  jobs: Job[];
  now: Date;
  activeId: string | null;
  onOpen: (id: string) => void;
}) {
  const { resume: words } = useCopy(tradeDataCopy);
  const { lang } = useLang();
  const [period, setPeriod] = useState<Period>('annual');
  const [hot, setHot] = useState<string | null>(null);
  const span = careerSpan(jobs, now, 'last end');
  const years = span ? spanYears(span) : [];
  const tenures = new Map(jobs.map((job) => [job.id, tenureOf(job, now)]));
  const longest = Math.max(...[...tenures.values()].map((t) => t.months));
  const current = jobs.find((job) => job.id === hot);
  const duration = (months: number) => formatDuration(months, words.units);
  const monthsText = (months: number) =>
    months === 1
      ? words.units.monthOne
      : fill(words.units.monthMany, { count: months });
  const periodOf = (job: Job) =>
    formatPeriod(job.startMonth, job.endMonth, lang);
  const currentMonths = current ? tenures.get(current.id)?.months : undefined;
  const readout =
    current && currentMonths !== undefined
      ? `${current.company} · ${current.role} · ${periodOf(current)} · ${duration(currentMonths)}`
      : fill(words.statement.summary, {
          roles: jobs.length,
          from: span?.from ?? '',
          to: span?.to ?? '',
        });

  const bar = (
    job: Job,
    tenure: Tenure,
    index: number,
    style: CSSProperties,
  ) => (
    <button
      type='button'
      aria-label={fill(words.statement.bar, {
        role: job.role,
        company: job.company,
        period: periodOf(job),
        duration: duration(tenure.months),
      })}
      data-bar={job.id}
      style={cssVars({ '--i': index }, style)}
      onClick={() => onOpen(job.id)}
      onMouseEnter={() => setHot(job.id)}
      onMouseLeave={() => setHot(null)}
      onFocus={() => setHot(job.id)}
      onBlur={() => setHot(null)}
      className={cn(
        'absolute top-1.5 flex h-5 min-w-2 cursor-pointer items-center overflow-hidden rounded-sm px-1.5 text-left text-[11px] font-semibold text-white transition-[filter] duration-100 hover:brightness-125 focus-visible:brightness-125 focus-visible:outline-white active:brightness-90 pointer-coarse:h-7',
        GROW,
        isCurrent(job) ? 'bg-tv-up-solid' : 'bg-tv-accent',
        job.id === activeId && 'shadow-[inset_0_0_0_2px_var(--tv-ink)]',
      )}
    >
      <span className='truncate'>{job.shortName || job.company}</span>
    </button>
  );

  const label = (job: Job) => (
    <div
      role='rowheader'
      data-label=''
      className={cn(
        STICKY,
        'col-start-1 row-start-1 flex flex-col justify-center px-3.5',
      )}
    >
      <p
        title={job.role}
        className='truncate text-[13px] leading-[1.25] font-semibold'
      >
        {job.role}
      </p>
      <p
        title={job.company}
        className='flex min-w-0 items-center gap-1.5 text-xs leading-[1.25] text-tv-mute'
      >
        <span className='truncate'>{job.company}</span>
        {isCurrent(job) && <DataCurrentMark />}
      </p>
    </div>
  );

  const corner = (text: string) => (
    <div
      role='columnheader'
      data-label=''
      className={cn(STICKY, 'truncate px-3.5 py-1.5')}
    >
      {text}
    </div>
  );

  return (
    <div>
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 pb-2'>
        <p
          title={readout}
          className='h-5 min-w-0 flex-1 basis-[200px] truncate text-xs/5 text-tv-mute'
        >
          {current ? (
            <>
              <strong className='font-semibold text-tv-ink'>
                {current.company}
              </strong>
              {readout.slice(current.company.length)}
            </>
          ) : (
            readout
          )}
        </p>
        <DataSegmented
          label={words.period.label}
          value={period}
          onChange={setPeriod}
          options={[
            { value: 'annual', label: words.period.annual },
            { value: 'role', label: words.period.byRole },
          ]}
        />
      </div>
      <div className='max-w-full overflow-x-auto' data-testid='statement-box'>
        {period === 'annual' ? (
          <div
            role='table'
            aria-label={words.statement.label}
            style={cssVars(
              {
                '--tv-years': years.length,
                '--tv-cols': `${LABEL}px repeat(${years.length}, minmax(${YEAR_MIN}px, 1fr))`,
              },
              { minWidth: LABEL + years.length * YEAR_MIN },
            )}
          >
            <div
              role='row'
              className='grid h-8 grid-cols-(--tv-cols) border-y border-tv-line bg-tv-bg text-xs text-tv-mute'
            >
              {corner(words.statement.role)}
              {years.map((year) => (
                <div
                  key={year}
                  role='columnheader'
                  className='min-w-0 border-l border-tv-line py-1.5 text-center tabular-nums first:border-l-0'
                >
                  {year}
                </div>
              ))}
            </div>
            {jobs.map((job, index) => {
              const tenure = tenures.get(job.id)!;
              const place = barPlacement(tenure, years);
              return (
                <div
                  key={job.id}
                  role='row'
                  data-testid='statement-row'
                  data-hot={hot === job.id || job.id === activeId}
                  className={cn(ROW, 'grid-cols-(--tv-cols)')}
                >
                  {label(job)}
                  {years.map((year, column) => {
                    const months = monthsInYear(tenure, year);
                    return (
                      <div
                        key={year}
                        role='cell'
                        data-year=''
                        // every cell has its own column of the one row, so the bar layer (which spans them) never pushes one to a row of its own
                        style={{ gridColumnStart: column + 2 }}
                        aria-label={
                          months > 0
                            ? fill(words.statement.inYear, {
                                months: monthsText(months),
                                year,
                              })
                            : undefined
                        }
                        className='row-start-1 flex min-w-0 items-end justify-center border-l border-tv-line pb-1 text-[10px]/3 text-tv-dim tabular-nums'
                      >
                        {months > 0 && <span aria-hidden='true'>{months}</span>}
                      </div>
                    );
                  })}
                  <div
                    data-track=''
                    className='pointer-events-none relative z-[1] col-[2/-1] row-start-1 overflow-hidden'
                  >
                    {bar(job, tenure, index, {
                      left: `${place.left * 100}%`,
                      width: `${place.width * 100}%`,
                      pointerEvents: 'auto',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            role='table'
            aria-label={words.statement.label}
            style={cssVars(
              { '--tv-cols': BY_ROLE_COLUMNS },
              { minWidth: LABEL + 150 + 120 + 140 },
            )}
          >
            <div
              role='row'
              className='grid h-8 grid-cols-(--tv-cols) border-y border-tv-line bg-tv-bg text-xs text-tv-mute'
            >
              {corner(words.statement.role)}
              <div role='columnheader' className='truncate py-1.5 pl-3.5'>
                {words.statement.period}
              </div>
              <div role='columnheader' className='truncate py-1.5'>
                {words.statement.duration}
              </div>
              <div role='columnheader' aria-hidden='true' />
            </div>
            {jobs.map((job, index) => {
              const tenure = tenures.get(job.id)!;
              return (
                <div
                  key={job.id}
                  role='row'
                  data-testid='statement-row'
                  data-hot={hot === job.id || job.id === activeId}
                  className={cn(ROW, 'grid-cols-(--tv-cols)')}
                >
                  {label(job)}
                  <div
                    role='cell'
                    title={periodOf(job)}
                    className='flex min-w-0 items-center pl-3.5 text-xs'
                  >
                    <span className='truncate'>{periodOf(job)}</span>
                  </div>
                  <div
                    role='cell'
                    title={duration(tenure.months)}
                    className='flex min-w-0 items-center text-xs'
                  >
                    <span className='truncate'>{duration(tenure.months)}</span>
                  </div>
                  <div
                    data-track=''
                    className='pointer-events-none relative overflow-hidden pr-3.5'
                  >
                    {bar(job, tenure, index, {
                      left: 0,
                      width: `${(tenure.months / longest) * 100}%`,
                      maxWidth: 'calc(100% - 14px)',
                      pointerEvents: 'auto',
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
