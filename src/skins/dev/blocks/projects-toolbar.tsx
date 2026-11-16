/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
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
import { DevFilterGroup } from '@/skins/dev/blocks/filter-group';
import { DevCaret } from '@/skins/dev/ui/dev-caret';
import { activeFilterCount } from '@/lib/derive/project-view';

const INPUT =
  'h-8 w-[190px] rounded-[4px] border border-line-2 bg-editor px-2.5 font-code text-[13px] leading-[normal] text-head outline-none placeholder:text-dim focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal max-[520px]:w-full pointer-coarse:min-h-11';
const BUTTON =
  "inline-flex h-8 cursor-pointer items-center gap-2 rounded-[4px] border border-line-2 bg-editor px-2.5 font-code text-[13px] leading-[normal] text-ink outline-none before:text-dim before:content-['--'_/_''] hover:border-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal data-popup-open:border-signal pointer-coarse:min-h-11";
const MENU =
  'rounded-[8px] border border-line-2 bg-chrome p-3 font-code text-ink shadow-[0_12px_32px_rgba(0,0,0,0.35)] ring-0';
const TEXT_BUTTON =
  'inline-flex cursor-pointer items-center border-0 border-b border-b-transparent bg-transparent p-0 font-code text-[13px] text-sky hover:border-b-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal pointer-coarse:min-h-11';

/** The command the choice makes, `projects ls --sort=latest --platform=mobile "text"`: it only decorates (it says what the controls say). */
function commandOf(view: ProjectView): string {
  const flags = [
    view.sort.value !== 'manual' && `--sort=${view.sort.value}`,
    ...(['kind', 'platform', 'status', 'tech'] as const).map(
      (group) =>
        view.groups[group].selected.length > 0 &&
        `--${group}=${view.groups[group].selected.join(',')}`,
    ),
    view.search.value.trim() !== '' && `"${view.search.value.trim()}"`,
  ].filter(Boolean);
  return ['projects ls', ...flags].join(' ');
}

/**
 * The controls of the Projects page as one line of a terminal: the prompt echoes the command the choice makes (`$ projects ls
 * --platform=mobile`), then a search field and two buttons that read like flags, `--filters` and `--sort`, each opening a menu in the code
 * font (the filters as rows of `--flags` with the number a choice would show; the orders as a list). What is on offer is the owner's
 * (`site/live`, `projects`) and `useProjectView`'s; this only draws it.
 */
export function DevProjectsToolbar({ view }: { view: ProjectView }) {
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
      className='mt-1 mb-[18px] flex flex-wrap items-center gap-x-2.5 gap-y-2 rounded-[8px] border border-line-2 bg-chrome px-3 py-2'
      data-reveal
    >
      <p
        aria-hidden='true'
        className='m-0 min-w-[160px] flex-1 truncate font-code text-[13px] leading-[1.5] text-ink max-[620px]:basis-full'
      >
        <span className='mr-2 text-signal'>$</span>
        {commandOf(view)}
        <DevCaret />
      </p>
      {search.visible && (
        <input
          type='search'
          aria-label={copy.filters.search}
          placeholder={copy.filters.searchPlaceholder}
          value={search.value}
          onChange={(event) => search.set(event.target.value)}
          className={INPUT}
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
            {copy.filters.title}
            {active > 0 && (
              <span aria-hidden='true' className='text-signal'>
                {active}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent
            align='start'
            aria-label={copy.filters.title}
            className={cn(
              MENU,
              'w-[min(600px,calc(100vw-24px))] flex-col gap-3',
            )}
          >
            {groups.kind.visible && (
              <DevFilterGroup
                bare
                label={copy.filters.kind}
                caption={copy.filters.kind}
                selected={
                  groups.kind.selected.length ? groups.kind.selected : ['all']
                }
                options={[
                  { value: 'all', label: copy.filterAll },
                  ...groups.kind.options.map((o) => ({
                    value: o.value,
                    label: copy.kinds[o.value as keyof typeof copy.kinds],
                    count: o.count,
                  })),
                ]}
                onChange={(value) =>
                  groups.kind.set(value === 'all' ? [] : [value])
                }
              />
            )}
            {groups.platform.visible && (
              <DevFilterGroup
                bare
                label={copy.filters.platform}
                caption={copy.filters.platform}
                selected={groups.platform.selected}
                options={groups.platform.options.map((o) => ({
                  value: o.value,
                  label: copy.platforms[o.value as keyof typeof copy.platforms],
                  count: o.count,
                }))}
                onChange={groups.platform.toggle}
              />
            )}
            {groups.status.visible && (
              <DevFilterGroup
                bare
                label={copy.filters.status}
                caption={copy.filters.status}
                selected={groups.status.selected}
                options={groups.status.options.map((o) => ({
                  value: o.value,
                  label: copy.statuses[o.value as keyof typeof copy.statuses],
                  count: o.count,
                }))}
                onChange={groups.status.toggle}
              />
            )}
            {groups.tech.visible && (
              <DevFilterGroup
                bare
                label={copy.filters.tech}
                caption={copy.filters.tech}
                selected={groups.tech.selected}
                options={[...view.tech.top, ...(showMore ? techMore : [])].map(
                  (o) => ({
                    value: o.value,
                    label: o.label,
                    count: o.count,
                  }),
                )}
                onChange={groups.tech.toggle}
              >
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
              </DevFilterGroup>
            )}
          </PopoverContent>
        </Popover>
      )}
      {sort.visible && (
        <Popover open={sortOpen} onOpenChange={setSortOpen}>
          <PopoverTrigger aria-label={copy.sortLabel} className={BUTTON}>
            {copy.sort[sort.value]}
          </PopoverTrigger>
          <PopoverContent
            align='start'
            aria-label={copy.sortLabel}
            className={cn(MENU, 'w-[min(260px,calc(100vw-24px))] gap-0 p-1.5')}
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
                    'flex min-h-8 w-full cursor-pointer items-center justify-between gap-3 rounded-[4px] px-2.5 text-left font-code text-[13px] text-mute hover:bg-editor hover:text-head focus-visible:outline-2 focus-visible:outline-signal pointer-coarse:min-h-11',
                    sort.value === value && 'text-signal',
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
        className="m-0 font-code text-[12.5px] text-mute before:content-['#_'/'']"
      >
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
