/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useState } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import { useNow } from '@/hooks/use-now';
import { fill } from '@/lib/chat/fill';
import type { Doc, Skill } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { formatUsed } from '@/lib/derive/duration-label';
import { initialOf } from '@/lib/derive/initials';
import {
  careerSpan,
  monthsUsed,
  rolesUsing,
  skillSeries,
} from '@/lib/derive/skill-use';
import { skillGroups } from '@/lib/derive/skill-groups';
import { STRIP_ORDER } from '@/lib/derive/skill-strip';
import type { Tile } from '@/skins/trade/config';
import { rovingKeys } from '@/skins/trade/shell/roving-keys';
import { Sparkline } from '@/skins/trade/shell/sparkline';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';
import { TvTile } from '@/skins/trade/ui/tv-tile';

const TILE: Record<Skill['category'], Tile> = {
  mobile: 'up',
  web: 'sky',
  ai: 'violet',
  tools: 'gold',
};

/**
 * The Technologies list of the watchlist: the listed skills grouped by area, each with the time I used it and a sparkline of how
 * many of my roles listed it in each year of the career. The numbers come from the roles, nothing is estimated. Pointing at a row,
 * moving to it with the keys or pressing it shows the roles that list it in the legend under the list.
 */
export function WatchTech() {
  const copy = useCopy(tradeShellCopy);
  const words = copy.watch;
  const areas = useCopy(resumeCopy).skills.groups;
  const { lang } = useLang();
  const skillsQuery = useContentQuery('skills');
  const jobsQuery = useContentQuery('experience');
  const now = useNow();
  const [pointed, setPointed] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);

  const skills = useMemo(() => skillsQuery.data ?? [], [skillsQuery.data]);
  const jobs = useMemo(() => jobsQuery.data ?? [], [jobsQuery.data]);
  const span = useMemo(() => careerSpan(jobs, now), [jobs, now]);
  const groups = useMemo(
    () =>
      skillGroups(skills, STRIP_ORDER).map(({ category, items }) => ({
        category,
        items: items.map((skill) => ({
          skill,
          months: monthsUsed(skill.id, jobs, now),
          series: span ? skillSeries(skill.id, jobs, span, now) : [],
        })),
      })),
    [skills, jobs, span, now],
  );

  const shownId = pointed ?? pinned;
  const shown = shownId ? skills.find((skill) => skill.id === shownId) : null;
  const shownRoles = shown ? rolesUsing(shown.id, jobs) : [];
  const shownUsed = shown
    ? formatUsed(monthsUsed(shown.id, jobs, now), copy.tape)
    : '';

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      <TvDataState
        query={skillsQuery}
        count={groups.length}
        empty='skills'
        subject='skills'
        level={3}
        className='m-3'
        skeleton={
          <div className='grid gap-1 p-3'>
            {Array.from({ length: 8 }, (_, i) => (
              <TvSkeleton key={i} className='h-6 border-0' />
            ))}
          </div>
        }
      >
        <div className='min-h-0 flex-1 overflow-y-auto' onKeyDown={rovingKeys}>
          <p className='px-3.5 pt-2 pb-1 text-[11px]/[1.45] text-tv-mute'>
            {words.unitsHint}
          </p>
          {groups.map((group) => (
            <section key={group.category} aria-label={areas[group.category]}>
              <h3 className='px-3.5 pt-2 pb-1 text-[11px] font-bold tracking-wide text-tv-mute uppercase'>
                {areas[group.category]}
              </h3>
              <ul>
                {group.items.map(({ skill, months, series }) => (
                  <li key={skill.id}>
                    <button
                      type='button'
                      data-roving=''
                      aria-pressed={pinned === skill.id}
                      onPointerEnter={() => setPointed(skill.id)}
                      onPointerLeave={() => setPointed(null)}
                      onFocus={() => setPointed(skill.id)}
                      onBlur={() => setPointed(null)}
                      onClick={() =>
                        setPinned((id) => (id === skill.id ? null : skill.id))
                      }
                      className={cn(
                        'grid min-h-[28px] w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-3.5 text-left transition-[background-color] duration-100 hover:bg-tv-hover active:bg-tv-hover aria-pressed:bg-tv-accent/15 hover:aria-pressed:bg-tv-accent/20 pointer-coarse:min-h-11',
                      )}
                    >
                      <span className='flex min-w-0 items-center gap-2 font-semibold'>
                        <TvTile tile={TILE[skill.category]} size='sm'>
                          {initialOf(skill.name)}
                        </TvTile>
                        <span className='truncate'>{skill.name}</span>
                      </span>
                      <Sparkline values={series} />
                      <span className='w-11 text-right text-tv-mute tabular-nums'>
                        {months > 0 ? formatUsed(months, copy.tape) : ''}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <div
          role='status'
          aria-live='polite'
          className='min-h-[78px] flex-none border-t border-tv-line bg-tv-panel px-3.5 py-2 text-xs/[1.5]'
        >
          {shown ? (
            <>
              <p className='font-semibold'>
                {shownRoles.length === 0
                  ? shown.name
                  : fill(
                      shownRoles.length === 1
                        ? words.legendUsedOne
                        : words.legendUsed,
                      {
                        name: shown.name,
                        used: shownUsed,
                        count: shownRoles.length,
                      },
                    )}
              </p>
              {shownRoles.length === 0 ? (
                <p className='text-tv-mute'>{words.legendNoRoles}</p>
              ) : (
                <ul className='text-tv-mute'>
                  {shownRoles.map((job: Doc<'experience'>) => (
                    <li key={job.id} className='truncate'>
                      {job.role}, {job.shortName || job.company}
                      {' · '}
                      {formatPeriod(job.startMonth, job.endMonth, lang)}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <p className='text-tv-mute'>{words.legendEmpty}</p>
          )}
        </div>
      </TvDataState>
    </div>
  );
}
