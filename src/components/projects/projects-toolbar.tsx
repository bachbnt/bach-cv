/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ProjectFilterChip } from '@/components/projects/project-filter-chip';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from 'cn';
import { activeFilterCount } from '@/lib/derive/project-view';

const BUTTON =
  'inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-border bg-card px-4 text-[15px] font-medium transition-[border-color,background-color,scale] outline-none hover:border-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[.98] data-popup-open:border-foreground min-[721px]:h-10';
const TEXT_BUTTON =
  'inline-flex min-h-11 items-center text-[15px] font-semibold text-brand-ink underline underline-offset-4 min-[721px]:min-h-0 pointer-coarse:min-h-11';

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role='group' aria-label={label} className='flex flex-col gap-2'>
      <span className='text-[13px] font-semibold text-muted-foreground'>
        {label}
      </span>
      <div className='flex flex-wrap gap-2'>{children}</div>
    </div>
  );
}

/**
 * The controls of the Projects page, kept small: a search box, one button for the filters and one for the order, each opening a menu (the
 * type, the platform, the status and the technologies with the most used first and the rest behind "More"; the six orders). A line says how
 * many projects are left. What is on offer is the owner's `site/live` and `useProjectView`'s (`lib/derive/project-view.ts`).
 */
export function ProjectsToolbar({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const { groups, sort, search } = view;
  const techMore = view.tech.more;
  const showMore =
    moreOpen || techMore.some((o) => groups.tech.selected.includes(o.value));
  const anyFilter = Object.values(groups).some((group) => group.visible);
  const active = activeFilterCount(groups);
  if (!anyFilter && !sort.visible && !search.visible) return null;

  return (
    <div
      role='group'
      aria-label={copy.filterLabel}
      className='mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-3'
    >
      {search.visible && (
        <Input
          type='search'
          aria-label={copy.filters.search}
          placeholder={copy.filters.searchPlaceholder}
          value={search.value}
          onChange={(event) => search.set(event.target.value)}
          className='h-11 w-[230px] rounded-full border-[1.5px] bg-card px-4 text-[15px] max-[520px]:w-full min-[721px]:h-10 md:text-[15px]'
        />
      )}
      {anyFilter && (
        <Popover>
          <PopoverTrigger
            aria-label={
              active > 0
                ? `${copy.filters.title}, ${active}`
                : copy.filters.title
            }
            className={BUTTON}
          >
            <SlidersHorizontal aria-hidden='true' className='size-4' />
            {copy.filters.title}
            {active > 0 && (
              <span
                aria-hidden='true'
                className='rounded-full bg-page px-1.5 text-[12px] leading-5 text-background tabular-nums'
              >
                {active}
              </span>
            )}
            <ChevronDown aria-hidden='true' className='size-4 opacity-60' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            aria-label={copy.filters.title}
            className='w-[min(440px,calc(100vw-24px))] gap-4 rounded-2xl border bg-card p-4 text-foreground'
          >
            {groups.kind.visible && (
              <Section label={copy.filters.kind}>
                <ProjectFilterChip
                  label={copy.filterAll}
                  pressed={groups.kind.selected.length === 0}
                  onClick={() => groups.kind.set([])}
                />
                {groups.kind.options.map((option) => (
                  <ProjectFilterChip
                    key={option.value}
                    label={copy.kinds[option.value as keyof typeof copy.kinds]}
                    count={option.count}
                    pressed={groups.kind.selected.includes(option.value)}
                    onClick={() => groups.kind.set([option.value])}
                  />
                ))}
              </Section>
            )}
            {groups.platform.visible && (
              <Section label={copy.filters.platform}>
                {groups.platform.options.map((option) => (
                  <ProjectFilterChip
                    key={option.value}
                    label={
                      copy.platforms[
                        option.value as keyof typeof copy.platforms
                      ]
                    }
                    count={option.count}
                    pressed={groups.platform.selected.includes(option.value)}
                    onClick={() => groups.platform.toggle(option.value)}
                  />
                ))}
              </Section>
            )}
            {groups.status.visible && (
              <Section label={copy.filters.status}>
                {groups.status.options.map((option) => (
                  <ProjectFilterChip
                    key={option.value}
                    label={
                      copy.statuses[option.value as keyof typeof copy.statuses]
                    }
                    count={option.count}
                    pressed={groups.status.selected.includes(option.value)}
                    onClick={() => groups.status.toggle(option.value)}
                  />
                ))}
              </Section>
            )}
            {groups.tech.visible && (
              <Section label={copy.filters.tech}>
                {[...view.tech.top, ...(showMore ? techMore : [])].map(
                  (option) => (
                    <ProjectFilterChip
                      key={option.value}
                      label={option.label}
                      count={option.count}
                      pressed={groups.tech.selected.includes(option.value)}
                      onClick={() => groups.tech.toggle(option.value)}
                    />
                  ),
                )}
                {techMore.length > 0 && (
                  <button
                    type='button'
                    aria-expanded={showMore}
                    onClick={() => setMoreOpen(!showMore)}
                    className={cn(TEXT_BUTTON, 'px-2')}
                  >
                    {showMore ? copy.filters.fewer : copy.filters.more}
                  </button>
                )}
              </Section>
            )}
          </PopoverContent>
        </Popover>
      )}
      {sort.visible && (
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger aria-label={copy.sortLabel} className={BUTTON}>
            <ArrowUpDown aria-hidden='true' className='size-4' />
            {copy.sort[sort.value]}
            <ChevronDown aria-hidden='true' className='size-4 opacity-60' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            aria-label={copy.sortLabel}
            className='w-[min(260px,calc(100vw-24px))] gap-0 rounded-2xl border bg-card p-1.5 text-foreground'
          >
            <div role='radiogroup' aria-label={copy.sortLabel}>
              {sort.options.map((value) => (
                <button
                  key={value}
                  type='button'
                  role='radio'
                  aria-checked={sort.value === value}
                  onClick={() => {
                    sort.set(value);
                    setSortOpen(false);
                  }}
                  className={cn(
                    'flex min-h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-left text-[15px] transition-colors hover:bg-muted min-[721px]:min-h-10',
                    sort.value === value && 'font-semibold',
                  )}
                >
                  {copy.sort[value]}
                  {sort.value === value && (
                    <Check aria-hidden='true' className='size-4' />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <div className='flex items-center gap-x-4 min-[721px]:ml-auto'>
        <p aria-live='polite' className='text-[15px] text-muted-foreground'>
          {fill(copy.filters.count, {
            shown: String(view.shown.length),
            total: String(view.total),
          })}
        </p>
        {view.clearable && (
          <button type='button' onClick={view.clear} className={TEXT_BUTTON}>
            {copy.filters.clear}
          </button>
        )}
      </div>
    </div>
  );
}
