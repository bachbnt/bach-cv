/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ArrowUpDown,
  Check,
  ChevronDown,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { useState, type RefObject } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { ProjectView } from '@/hooks/use-project-view';
import {
  PROJECT_COLUMNS,
  type ProjectColumn,
  activeFilterCount,
} from '@/lib/derive/project-view';
import { toggleValue } from '@/lib/derive/project-view';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { DataChecklistPopover } from '@/skins/trade/blocks/data-checklist-popover';
import type { Density } from '@/skins/trade/blocks/data-projects-model';
import { DataSegmented } from '@/skins/trade/blocks/data-segmented';
import { cn } from '@/lib/utils';
import { tvButton, TvButton } from '@/skins/trade/ui/tv-button';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';
import { TV_BADGE } from '@/skins/trade/ui/tv-chip';
import { TV_POPUP } from '@/skins/trade/ui/tv-menu';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';

/**
 * The filters and settings of the screener, as a chart terminal has them: a text filter (the `/` key focuses it), ONE Filters button that opens
 * a menu (the type, and the platform, the status and the technologies as lists of checkboxes with a count), featured only, ONE button for the
 * order (a click on a header of the table sorts too), the density and the columns of the table, and how many projects match. What is on offer is the owner's
 * (`site/live`, `projects`) and `useProjectView`'s.
 */
export function DataScreenerBar({
  view,
  featuredOnly,
  onFeaturedOnly,
  clearable,
  onClear,
  sortValue,
  onSortChange,
  density,
  onDensity,
  columns,
  onColumns,
  showColumns,
  showDensity,
  shown,
  inputRef,
}: {
  view: ProjectView;
  featuredOnly: boolean;
  onFeaturedOnly: (on: boolean) => void;
  /** a filter is on that "Clear filters" takes off */
  clearable: boolean;
  onClear: () => void;
  /** the order that shows in the list: empty when the visitor has sorted by a column that is not one of the orders */
  sortValue: string;
  onSortChange: (value: ProjectView['sort']['value']) => void;
  density: Density;
  onDensity: (value: Density) => void;
  columns: Set<ProjectColumn>;
  onColumns: (next: Set<ProjectColumn>) => void;
  /** the column chooser is for the table only */
  showColumns: boolean;
  /** a heatmap has one size of tile, so no density */
  showDensity: boolean;
  shown: number;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const { groups, sort, search } = view;
  const [sortOpen, setSortOpen] = useState(false);
  const anyFilter = Object.values(groups).some((group) => group.visible);
  const active = activeFilterCount(groups);
  /** The choices of a filter as chips, each with the number of projects it leaves, as a section of the menu of the filters. */
  const chips = (
    group: 'platform' | 'status' | 'tech',
    label: string,
    name: (option: { value: string; label: string }) => string,
  ) =>
    groups[group].visible && (
      <div role='group' aria-label={label} className='flex flex-col gap-1'>
        <p className='px-2 pt-1 text-[11px] font-semibold text-tv-mute'>
          {label}
        </p>
        <div className='flex max-h-[132px] flex-wrap gap-1.5 overflow-auto px-1.5 pb-1'>
          {groups[group].options.map((option) => (
            <TvToggleChip
              key={option.value}
              aria-pressed={groups[group].selected.includes(option.value)}
              aria-label={`${name(option)}, ${option.count}`}
              onClick={() => groups[group].toggle(option.value)}
            >
              {name(option)}
              <span aria-hidden='true' className='text-tv-mute tabular-nums'>
                {option.count}
              </span>
            </TvToggleChip>
          ))}
        </div>
      </div>
    );

  return (
    <div className='flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-tv-line px-3.5 py-2'>
      {search.visible && (
        <label className='relative flex items-center'>
          <span className='sr-only'>{words.filter.label}</span>
          <Search
            aria-hidden='true'
            className='pointer-events-none absolute left-2 size-3.5 text-tv-mute'
          />
          <input
            ref={inputRef}
            type='text'
            role='searchbox'
            autoComplete='off'
            value={search.value}
            placeholder={words.filter.placeholder}
            onChange={(e) => search.set(e.target.value)}
            className={cn(
              TV_FIELD,
              // a fixed width: a width that grows on focus moves the chips beside it and animates layout
              'w-[200px] pr-7 pl-7 max-[480px]:w-full',
            )}
          />
          <kbd
            aria-hidden='true'
            className='pointer-events-none absolute right-2 rounded border border-tv-line px-1 text-[10px]/4 text-tv-mute pointer-coarse:hidden'
          >
            /
          </kbd>
        </label>
      )}
      <TvToggleChip
        aria-pressed={featuredOnly}
        onClick={() => onFeaturedOnly(!featuredOnly)}
      >
        <Star aria-hidden='true' className='size-3' />
        {words.filter.featuredOnly}
      </TvToggleChip>
      {anyFilter && (
        <Popover>
          <PopoverTrigger
            aria-label={
              active > 0
                ? `${copy.filters.title}, ${active}`
                : copy.filters.title
            }
            className={cn(
              tvButton({ variant: 'outline' }),
              'h-[26px] px-2.5 data-popup-open:bg-tv-hover',
            )}
          >
            <SlidersHorizontal aria-hidden='true' className='!size-3' />
            {copy.filters.title}
            {active > 0 && (
              <span aria-hidden='true' className={TV_BADGE}>
                {active}
              </span>
            )}
            <ChevronDown aria-hidden='true' className='!size-3 opacity-60' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            sideOffset={6}
            aria-label={copy.filters.title}
            className={cn(
              'max-h-[min(440px,calc(100vh-240px))] w-[min(340px,calc(100vw-24px))] gap-1.5 overflow-auto',
              TV_POPUP,
            )}
          >
            {groups.kind.visible && (
              <div
                role='group'
                aria-label={copy.filters.kind}
                className='flex flex-col gap-1'
              >
                <p className='px-2 pt-1 text-[11px] font-semibold text-tv-mute'>
                  {copy.filters.kind}
                </p>
                <div className='flex flex-wrap gap-1.5 px-1.5 pb-1'>
                  {(
                    ['all', ...groups.kind.options.map((o) => o.value)] as const
                  ).map((value) => (
                    <TvToggleChip
                      key={value}
                      aria-pressed={
                        value === 'all'
                          ? groups.kind.selected.length === 0
                          : groups.kind.selected.includes(value)
                      }
                      onClick={() =>
                        groups.kind.set(value === 'all' ? [] : [value])
                      }
                    >
                      {value === 'all'
                        ? copy.filterAll
                        : copy.kinds[value as keyof typeof copy.kinds]}
                    </TvToggleChip>
                  ))}
                </div>
              </div>
            )}
            {chips(
              'platform',
              copy.filters.platform,
              (option) =>
                copy.platforms[option.value as keyof typeof copy.platforms],
            )}
            {chips(
              'status',
              copy.filters.status,
              (option) =>
                copy.statuses[option.value as keyof typeof copy.statuses],
            )}
            {chips('tech', copy.filters.tech, (option) => option.label)}
          </PopoverContent>
        </Popover>
      )}
      {sort.visible && (
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger
            aria-label={copy.sortLabel}
            className={cn(
              tvButton({ variant: 'outline' }),
              'h-[26px] px-2.5 data-popup-open:bg-tv-hover',
            )}
          >
            <ArrowUpDown aria-hidden='true' className='!size-3' />
            {sortValue === ''
              ? words.sortCustom
              : copy.sort[sortValue as keyof typeof copy.sort]}
            <ChevronDown aria-hidden='true' className='!size-3 opacity-60' />
          </PopoverTrigger>
          <PopoverContent
            align='start'
            sideOffset={6}
            aria-label={copy.sortLabel}
            className={cn('w-[min(230px,calc(100vw-24px))] gap-0', TV_POPUP)}
          >
            <div role='radiogroup' aria-label={copy.sortLabel}>
              {sort.options.map((value) => (
                <button
                  key={value}
                  type='button'
                  role='radio'
                  aria-checked={sortValue === value}
                  onClick={() => {
                    onSortChange(value);
                    setSortOpen(false);
                  }}
                  className={cn(
                    'flex min-h-8 w-full cursor-pointer items-center justify-between gap-3 rounded px-2.5 text-left text-[13px] hover:bg-tv-hover pointer-coarse:min-h-11',
                    sortValue === value && 'font-semibold text-tv-ink',
                  )}
                >
                  {copy.sort[value]}
                  {sortValue === value && (
                    <Check aria-hidden='true' className='size-3.5' />
                  )}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      )}
      <div className='ml-auto flex flex-wrap items-center gap-2'>
        {showDensity && (
          <DataSegmented
            label={words.density.label}
            value={density}
            onChange={onDensity}
            options={[
              { value: 'compact', label: words.density.compact },
              { value: 'comfortable', label: words.density.comfortable },
            ]}
          />
        )}
        {showColumns && (
          <DataChecklistPopover
            label={words.columns.button}
            title={words.columns.title}
            items={PROJECT_COLUMNS.map((column) => ({
              id: column,
              label:
                column === 'name'
                  ? `${words.columns.name} (${words.columns.always})`
                  : words.columns[column],
              checked: column === 'name' || columns.has(column),
              locked: column === 'name',
            }))}
            onToggle={(id) => onColumns(new Set(toggleValue([...columns], id)))}
          />
        )}
      </div>
      <div className='flex basis-full items-center gap-2'>
        <p role='status' className='text-xs text-tv-mute tabular-nums'>
          {fill(words.results, { shown, total: view.total })}
        </p>
        {clearable && (
          <TvButton
            variant='ghost'
            size='sm'
            className='text-tv-accent-ink'
            onClick={onClear}
          >
            {words.filter.clear}
          </TvButton>
        )}
      </div>
    </div>
  );
}
