/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check, ChevronDown } from 'lucide-react';
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
import { AcChip } from '@/skins/academic/ui/ac-chip';
import { AC_SHEET } from '@/skins/academic/ui/ac-sheet';
import { lineInput } from '@/skins/academic/ui/ac-line-input';
import { AcRow } from '@/skins/academic/ui/ac-note';

const NOTE_BUTTON =
  'inline-flex min-h-8 cursor-pointer items-center border-0 bg-transparent p-0 font-ac-note text-[18px] text-ac-link underline underline-offset-4 pointer-coarse:min-h-11';

/** One choice: the word and the number of projects it would show in small writing beside it; "Mobile, 4" for a reader of the screen. */
function Choice({
  label,
  count,
  pressed,
  onClick,
}: {
  label: string;
  count?: number;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <AcChip
      aria-pressed={pressed}
      aria-label={count === undefined ? undefined : `${label}, ${count}`}
      onClick={onClick}
      className={cn(!pressed && count === 0 && 'opacity-50')}
    >
      {label}
      {count !== undefined && (
        <span aria-hidden='true' className='ml-2 text-[14px] text-ac-mute'>
          {count}
        </span>
      )}
    </AcChip>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role='group' aria-label={label} className='flex flex-col gap-1.5'>
      <span aria-hidden='true' className='text-[18px] text-ac-mute'>
        {label}:
      </span>
      <div className='flex flex-wrap gap-2'>{children}</div>
    </div>
  );
}

/**
 * The controls of the Projects page as a line on paper and two hand-drawn buttons, one for the filters and one for the order, each a sheet
 * that comes down from the button. The number of what is left and the way back ("Clear filters") are a note in the margin, tied to the line
 * by a bracket, like the notes of the other pages. What is on offer is the owner's (`site/live`, `projects`) and `useProjectView`'s.
 */
export function AcProjectsToolbar({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const [moreOpen, setMoreOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const { groups, sort, search } = view;
  const techMore = view.tech.more;
  const showMore =
    moreOpen || techMore.some((o) => groups.tech.selected.includes(o.value));
  const anyFilter = Object.values(groups).some((group) => group.visible);
  const active = Object.values(groups)
    .filter((group) => group.visible)
    .reduce((sum, group) => sum + group.selected.length, 0);
  if (!anyFilter && !sort.visible && !search.visible) return null;

  const note = (
    <>
      <p
        aria-live='polite'
        className='m-0 font-ac-chalk text-[26px]/[1.15] font-normal'
      >
        {fill(copy.filters.count, {
          shown: String(view.shown.length),
          total: String(view.total),
        })}
      </p>
      {view.clearable && (
        <button
          type='button'
          onClick={view.clear}
          className={cn(NOTE_BUTTON, 'mt-1')}
        >
          {copy.filters.clear}
        </button>
      )}
    </>
  );

  return (
    <div role='group' aria-label={copy.filterLabel} className='mt-4'>
      <AcRow tone='a' note={note}>
        <div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
          {search.visible && (
            <input
              type='search'
              aria-label={copy.filters.search}
              placeholder={copy.filters.searchPlaceholder}
              value={search.value}
              onChange={(event) => search.set(event.target.value)}
              className={cn(lineInput, 'max-w-[300px] min-w-[200px] flex-1')}
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
                render={<AcChip className='gap-1.5' />}
              >
                {copy.filters.title}
                {active > 0 && (
                  <span
                    aria-hidden='true'
                    className='text-[15px] text-ac-accent'
                  >
                    {active}
                  </span>
                )}
                <ChevronDown aria-hidden='true' className='size-4' />
              </PopoverTrigger>
              <PopoverContent
                align='start'
                aria-label={copy.filters.title}
                className={cn(
                  AC_SHEET,
                  'w-[min(520px,calc(100vw-24px))] gap-4',
                )}
              >
                {groups.kind.visible && (
                  <Row label={copy.filters.kind}>
                    <Choice
                      label={copy.filterAll}
                      pressed={groups.kind.selected.length === 0}
                      onClick={() => groups.kind.set([])}
                    />
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
                        label={
                          copy.statuses[o.value as keyof typeof copy.statuses]
                        }
                        count={o.count}
                        pressed={groups.status.selected.includes(o.value)}
                        onClick={() => groups.status.toggle(o.value)}
                      />
                    ))}
                  </Row>
                )}
                {groups.tech.visible && (
                  <Row label={copy.filters.tech}>
                    {[...view.tech.top, ...(showMore ? techMore : [])].map(
                      (o) => (
                        <Choice
                          key={o.value}
                          label={o.label}
                          count={o.count}
                          pressed={groups.tech.selected.includes(o.value)}
                          onClick={() => groups.tech.toggle(o.value)}
                        />
                      ),
                    )}
                    {techMore.length > 0 && (
                      <button
                        type='button'
                        aria-expanded={showMore}
                        onClick={() => setMoreOpen(!showMore)}
                        className={NOTE_BUTTON}
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
                render={<AcChip className='gap-1.5' />}
              >
                {copy.sort[sort.value]}
                <ChevronDown aria-hidden='true' className='size-4' />
              </PopoverTrigger>
              <PopoverContent
                align='start'
                aria-label={copy.sortLabel}
                className={cn(
                  AC_SHEET,
                  'w-[min(280px,calc(100vw-24px))] gap-0 p-2',
                )}
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
                        'flex min-h-9 w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent px-2 text-left font-ac-note text-[19px] text-ac-ink hover:bg-ac-faint/40 pointer-coarse:min-h-11',
                        sort.value === value && 'font-bold',
                      )}
                    >
                      <span
                        className={cn(
                          sort.value === value &&
                            'shadow-[inset_0_-5px_0_var(--ac-mark)]',
                        )}
                      >
                        {copy.sort[value]}
                      </span>
                      {sort.value === value && (
                        <Check aria-hidden='true' className='size-4' />
                      )}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </AcRow>
    </div>
  );
}
