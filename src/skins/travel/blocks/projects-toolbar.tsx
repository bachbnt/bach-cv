/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Globe,
  MapPin,
  Monitor,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { FilterChip } from '@/skins/travel/blocks/filter-chip';
import { STATUS_ICON } from '@/skins/travel/blocks/project-status';
import { activeFilterCount } from '@/lib/derive/project-view';

const CONTROL =
  'h-8 rounded-full border border-tl-line bg-tl-panel-2 px-3.5 text-[13px] font-semibold text-tl-ink outline-none placeholder:font-normal placeholder:text-tl-muted focus-visible:ring-2 focus-visible:ring-tl-ink/40 pointer-coarse:h-11';
const TEXT_BUTTON =
  'inline-flex min-h-8 cursor-pointer items-center rounded-full px-2 text-[13px] font-semibold text-tl-ink underline underline-offset-4 pointer-coarse:min-h-11';

/** How you get there: a platform is the vehicle of the trip, a status says whether the trip goes on or has arrived. Decoration, `aria-hidden`. */
const PLATFORM_ICON: Record<string, LucideIcon> = {
  mobile: Smartphone,
  web: Globe,
  desktop: Monitor,
  ai: Sparkles,
};

/** The shape of a luggage tag: square on the side of the string hole, round on the other. */
const TAG =
  "relative rounded-[6px_999px_999px_6px] pl-5 before:absolute before:top-1/2 before:left-2 before:size-1.5 before:-translate-y-1/2 before:rounded-full before:border before:border-current before:content-['']";

/** One choice: the word and, in small type, how many postcards it would leave; "Mobile, 4" for a reader of the screen. */
function Choice({
  label,
  count,
  pressed,
  onClick,
  icon: Icon,
  tag,
}: {
  label: string;
  count?: number;
  pressed: boolean;
  onClick: () => void;
  icon?: LucideIcon;
  /** a luggage tag instead of a pill (the technologies in the case) */
  tag?: boolean;
}) {
  return (
    <FilterChip
      pressed={pressed}
      aria-label={count === undefined ? undefined : `${label}, ${count}`}
      onClick={onClick}
      className={cn(
        'gap-1.5',
        tag && TAG,
        !pressed && count === 0 && 'opacity-50',
      )}
    >
      {Icon && <Icon aria-hidden='true' className='size-3.5' />}
      {label}
      {count !== undefined && (
        <span aria-hidden='true' className='text-[11px] font-normal opacity-70'>
          {count}
        </span>
      )}
    </FilterChip>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role='group'
      aria-label={label}
      className='flex flex-wrap items-center gap-1.5'
    >
      <span
        aria-hidden='true'
        className='min-w-[84px] text-[12px] font-bold tracking-wide text-tl-muted uppercase'
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/**
 * The controls of the Projects page as a travel agent's counter, kept to one line (the strip of postcards needs the height): a search field,
 * a **Filters** button and a sorter, each opening a card. In the filters a platform is a vehicle and a status says whether the trip goes on
 * or has arrived, a technology is a luggage tag; a pin marks the line of how many postcards are left. What is on offer is the owner's
 * (`site/live`, `projects`) and `useProjectView`'s; this only draws it.
 */
export function TlProjectsToolbar({ view }: { view: ProjectView }) {
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
      className='flex flex-wrap items-center gap-x-2 gap-y-1.5'
    >
      {search.visible && (
        <input
          type='search'
          aria-label={copy.filters.search}
          placeholder={copy.filters.searchPlaceholder}
          value={search.value}
          onChange={(event) => search.set(event.target.value)}
          className={cn(CONTROL, 'w-[190px] max-[520px]:w-full')}
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
            render={<FilterChip pressed={false} className='gap-1.5' />}
          >
            <SlidersHorizontal aria-hidden='true' className='size-3.5' />
            {copy.filters.title}
            {active > 0 && (
              <span
                aria-hidden='true'
                className='rounded-full bg-tl-ink px-1.5 text-[11px] leading-4 text-tl-solid'
              >
                {active}
              </span>
            )}
            <ChevronDown aria-hidden='true' className='size-3.5 opacity-60' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            aria-label={copy.filters.title}
            className='w-[min(460px,calc(100vw-24px))] gap-3 rounded-2xl border border-tl-line bg-tl-panel p-3.5 text-tl-ink ring-0'
          >
            {groups.kind.visible && (
              <Row label={copy.filters.kind}>
                <FilterChip
                  pressed={groups.kind.selected.length === 0}
                  onClick={() => groups.kind.set([])}
                >
                  {copy.filterAll}
                </FilterChip>
                {groups.kind.options.map((o) => (
                  <Choice
                    key={o.value}
                    label={copy.kinds[o.value as keyof typeof copy.kinds]}
                    count={o.count}
                    pressed={groups.kind.selected.includes(o.value)}
                    onClick={() => groups.kind.set([o.value])}
                  />
                ))}
              </Row>
            )}
            {groups.platform.visible && (
              <Row label={copy.filters.platform}>
                {groups.platform.options.map((o) => (
                  <Choice
                    key={o.value}
                    label={
                      copy.platforms[o.value as keyof typeof copy.platforms]
                    }
                    icon={PLATFORM_ICON[o.value]}
                    count={o.count}
                    pressed={groups.platform.selected.includes(o.value)}
                    onClick={() => groups.platform.toggle(o.value)}
                  />
                ))}
              </Row>
            )}
            {groups.status.visible && (
              <Row label={copy.filters.status}>
                {groups.status.options.map((o) => (
                  <Choice
                    key={o.value}
                    label={copy.statuses[o.value as keyof typeof copy.statuses]}
                    icon={STATUS_ICON[o.value as keyof typeof STATUS_ICON]}
                    count={o.count}
                    pressed={groups.status.selected.includes(o.value)}
                    onClick={() => groups.status.toggle(o.value)}
                  />
                ))}
              </Row>
            )}
            {groups.tech.visible && (
              <Row label={copy.filters.tech}>
                {[...view.tech.top, ...(showMore ? techMore : [])].map((o) => (
                  <Choice
                    key={o.value}
                    tag
                    label={o.label}
                    count={o.count}
                    pressed={groups.tech.selected.includes(o.value)}
                    onClick={() => groups.tech.toggle(o.value)}
                  />
                ))}
                {techMore.length > 0 && (
                  <button
                    type='button'
                    aria-expanded={showMore}
                    onClick={() => setMoreOpen(!showMore)}
                    className={TEXT_BUTTON}
                  >
                    {showMore ? copy.filters.fewer : copy.filters.more}
                  </button>
                )}
              </Row>
            )}
          </PopoverContent>
        </Popover>
      )}
      {sort.visible && (
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger
            aria-label={copy.sortLabel}
            render={<FilterChip pressed={false} className='gap-1.5' />}
          >
            <ArrowUpDown aria-hidden='true' className='size-3.5' />
            {copy.sort[sort.value]}
            <ChevronDown aria-hidden='true' className='size-3.5 opacity-60' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            aria-label={copy.sortLabel}
            className='w-[min(250px,calc(100vw-24px))] gap-0 rounded-2xl border border-tl-line bg-tl-panel p-1.5 text-tl-ink ring-0'
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
                    'flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 text-left text-[13px] font-semibold hover:bg-tl-chip pointer-coarse:min-h-11',
                    sort.value === value && 'bg-tl-chip',
                  )}
                >
                  {copy.sort[value]}
                  {sort.value === value && (
                    <Check aria-hidden='true' className='size-3.5' />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <p
        aria-live='polite'
        className='m-0 inline-flex items-center gap-1.5 text-[12.5px] text-tl-muted'
      >
        <MapPin aria-hidden='true' className='size-3.5' />
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
  );
}
