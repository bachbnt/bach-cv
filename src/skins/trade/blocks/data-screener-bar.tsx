/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Search, Star } from 'lucide-react';
import type { RefObject } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { DataChecklistPopover } from '@/skins/trade/blocks/data-checklist-popover';
import type { Density } from '@/skins/trade/blocks/data-projects-grid';
import {
  isFiltering,
  NO_FILTERS,
  PROJECT_COLUMNS,
  toggleId,
  type ProjectColumn,
  type ProjectFilters,
  type TechOption,
} from '@/skins/trade/blocks/data-projects-model';
import { DataSegmented } from '@/skins/trade/blocks/data-segmented';
import { cn } from '@/lib/utils';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TV_FIELD } from '@/skins/trade/ui/tv-field';
import { TvToggleChip } from '@/skins/trade/ui/tv-toggle-chip';

/**
 * The filters and settings of the screener: a text filter (the `/` key focuses it), the kind chips, featured only, the technologies, the
 * density and the columns of the table, and how many projects match.
 */
export function DataScreenerBar({
  filters,
  onFilters,
  kinds,
  techs,
  density,
  onDensity,
  columns,
  onColumns,
  showColumns,
  showDensity,
  shown,
  total,
  inputRef,
}: {
  filters: ProjectFilters;
  onFilters: (next: ProjectFilters) => void;
  kinds: Doc<'projects'>['kind'][];
  techs: TechOption[];
  density: Density;
  onDensity: (value: Density) => void;
  columns: Set<ProjectColumn>;
  onColumns: (next: Set<ProjectColumn>) => void;
  /** the column chooser is for the table only */
  showColumns: boolean;
  /** a heatmap has one size of tile, so no density */
  showDensity: boolean;
  shown: number;
  total: number;
  inputRef: RefObject<HTMLInputElement | null>;
}) {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const set = (patch: Partial<ProjectFilters>) =>
    onFilters({ ...filters, ...patch });

  return (
    <div className='flex flex-wrap items-center gap-x-2.5 gap-y-2 border-b border-tv-line px-3.5 py-2'>
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
          value={filters.text}
          placeholder={words.filter.placeholder}
          onChange={(e) => set({ text: e.target.value })}
          className={cn(
            TV_FIELD,
            'w-[180px] pr-7 pl-7 transition-[border-color,width] focus:w-[230px] max-[480px]:w-full max-[480px]:focus:w-full',
          )}
        />
        <kbd
          aria-hidden='true'
          className='pointer-events-none absolute right-2 rounded border border-tv-line px-1 text-[10px]/4 text-tv-mute pointer-coarse:hidden'
        >
          /
        </kbd>
      </label>
      {kinds.length > 1 && (
        <div
          role='group'
          aria-label={copy.filterLabel}
          className='flex flex-wrap gap-1.5'
        >
          {(['all', ...kinds] as const).map((value) => (
            <TvToggleChip
              key={value}
              aria-pressed={filters.kind === value}
              onClick={() => set({ kind: value })}
            >
              {value === 'all' ? copy.filterAll : copy.kinds[value]}
            </TvToggleChip>
          ))}
        </div>
      )}
      <TvToggleChip
        aria-pressed={filters.featuredOnly}
        onClick={() => set({ featuredOnly: !filters.featuredOnly })}
      >
        <Star aria-hidden='true' className='size-3' />
        {words.filter.featuredOnly}
      </TvToggleChip>
      {techs.length > 0 && (
        <DataChecklistPopover
          label={words.filter.technologies}
          title={words.filter.technologiesTitle}
          badge={
            filters.technologies.length > 0
              ? String(filters.technologies.length)
              : undefined
          }
          items={techs.map((tech) => ({
            id: tech.id,
            label: tech.name,
            count: tech.count,
            checked: filters.technologies.includes(tech.id),
          }))}
          onToggle={(id) =>
            set({ technologies: toggleId(filters.technologies, id) })
          }
          footer={
            filters.technologies.length > 0 && (
              <TvButton
                variant='ghost'
                size='sm'
                className='justify-start'
                onClick={() => set({ technologies: [] })}
              >
                {words.filter.clearTechnologies}
              </TvButton>
            )
          }
        />
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
            onToggle={(id) =>
              onColumns(new Set(toggleId([...columns], id) as ProjectColumn[]))
            }
          />
        )}
      </div>
      <div className='flex basis-full items-center gap-2'>
        <p role='status' className='text-xs text-tv-mute tabular-nums'>
          {fill(words.results, { shown, total })}
        </p>
        {isFiltering(filters) && (
          <TvButton
            variant='ghost'
            size='sm'
            className='text-tv-accent-ink'
            onClick={() => onFilters(NO_FILTERS)}
          >
            {words.filter.clear}
          </TvButton>
        )}
      </div>
    </div>
  );
}
