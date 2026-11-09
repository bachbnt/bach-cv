/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { formatIssued } from '@/components/certificates/format-issued';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { initialOf } from '@/lib/derive/initials';
import { formatMonth } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import {
  buildEvents,
  eventsByYear,
  type CareerEvent,
  type EventKind,
} from '@/skins/trade/blocks/data-resume-model';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';
import { TvTile } from '@/skins/trade/ui/tv-tile';
import { cssVars } from '@/skins/trade/ui/css-vars';

const KINDS = ['job', 'degree', 'certificate'] as const;
const TILE = { job: 'accent', degree: 'violet', certificate: 'gold' } as const;

/**
 * The events calendar: every job, degree and certificate in date order, the newest first, grouped by year. A job opens its note.
 * Degrees and certificates come from their own queries; they join the list as they arrive.
 */
export function DataEvents({
  jobs,
  onOpen,
}: {
  jobs: Doc<'experience'>[];
  onOpen: (id: string) => void;
}) {
  const { resume } = useCopy(tradeDataCopy);
  const words = resume.events;
  const { lang } = useLang();
  const degrees = useContentQuery('education').data ?? [];
  const certificates = useContentQuery('certificates');
  const [filter, setFilter] = useState<EventKind | 'all'>('all');
  const events = buildEvents(jobs, degrees, certificates.data ?? []);
  const shown =
    filter === 'all' ? events : events.filter((e) => e.kind === filter);
  const phase = { start: words.start, end: words.end, issued: words.issued };
  const kindLabel = {
    job: words.job,
    degree: words.degree,
    certificate: words.certificate,
  };
  const dateOf = (event: CareerEvent) =>
    event.date.length === 7
      ? formatMonth(event.date, lang)
      : formatIssued(event.date, lang);
  let index = 0;

  return (
    <div aria-busy={certificates.isPending || undefined}>
      <div
        role='group'
        aria-label={words.filter}
        className='flex flex-wrap gap-1.5 px-3.5 pb-2'
      >
        {(['all', ...KINDS] as const).map((value) => (
          <TvToggleChip
            key={value}
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
          >
            {value === 'all' ? words.all : kindLabel[value]}
          </TvToggleChip>
        ))}
      </div>
      {/* the filter is part of the key, so the rows slide in again when it changes */}
      <div key={filter}>
        {eventsByYear(shown).map((group) => (
          <section key={group.year} aria-label={group.year}>
            <h3 className='border-y border-tv-line bg-tv-hover/40 px-3.5 py-1 text-xs font-semibold text-tv-mute tabular-nums'>
              {group.year}
            </h3>
            <ul className='m-0 list-none p-0'>
              {group.events.map((event) => {
                const body = (
                  <>
                    <span className='w-[88px] flex-none text-left text-xs text-tv-mute tabular-nums'>
                      {dateOf(event)}
                    </span>
                    <TvTile tile={TILE[event.kind]}>
                      {initialOf(kindLabel[event.kind])}
                    </TvTile>
                    <span className='min-w-0 flex-1 text-left'>
                      <span className='block truncate text-[13px] font-medium'>
                        {event.title}
                      </span>
                      <span className='block truncate text-xs text-tv-mute'>
                        {event.subtitle}
                      </span>
                    </span>
                    <TvChip size='sm' className='flex-none'>
                      {phase[event.phase]}
                    </TvChip>
                  </>
                );
                const row =
                  'flex w-full items-center gap-2.5 px-3.5 py-1.5 transition-colors hover:bg-tv-hover/60 active:bg-tv-hover/60 pointer-coarse:min-h-11';
                return (
                  <li
                    key={event.id}
                    data-testid='event'
                    style={cssVars({ '--i': Math.min(index++, 12) })}
                    className='animate-tv-slide-in border-b border-tv-line [animation-delay:calc(var(--i)*30ms)]'
                  >
                    {event.jobId ? (
                      <button
                        type='button'
                        onClick={() => onOpen(event.jobId!)}
                        className={cn(row, 'cursor-pointer')}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className={row}>{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
