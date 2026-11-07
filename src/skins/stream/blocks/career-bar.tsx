/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';
import {
  chapterKey,
  type Chapter,
} from '@/skins/stream/blocks/career-chapters';
import { LiveBadge } from '@/skins/stream/ui/live-badge';

export interface CareerBarItem {
  id: string;
  /** the accessible name of the chapter: company, role and period in the words of the visitor's language */
  label: string;
  company: string;
  role: string;
  years: string;
}

/**
 * The chapters of the career as the segments of a seek bar, one for each role and as wide as the role lasted. It is the bar of the
 * player on Home (`bar`, thin, with the progress of the scene in `--sm-cp`) and the big timeline on Resume (`timeline`, tall, with
 * the company and the years in each block). Hovering or focusing a chapter shows its title (company and role); the one that is still
 * going carries the red LIVE mark.
 *
 * Roving focus: one chapter is in the tab order, the arrow keys, Home and End move to the others. On the player they also seek; on
 * the timeline they only move the focus and Enter or a click opens the chapter.
 */
export function CareerBar({
  variant,
  label,
  items,
  chapters,
  active,
  current,
  onSelect,
}: {
  variant: 'bar' | 'timeline';
  /** the name of the group */
  label: string;
  items: CareerBarItem[];
  chapters: Chapter[];
  /** the chapter that is playing (bar) or the last one that was opened (timeline) */
  active: number;
  /** the word of the red badge in a chapter's title ("Current") */
  current: string;
  /** `pointer` is false for a key that moves the focus and for Enter or Space */
  onSelect: (index: number, pointer: boolean) => void;
}) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const [stop, setStop] = useState(active);
  const seeking = variant === 'bar';
  const tabbable = seeking ? active : stop;

  const onKeyDown = (e: KeyboardEvent) => {
    const from = buttons.current.findIndex((b) => b === e.target);
    const to = chapterKey(e.key, from, items.length);
    if (from < 0 || to === null) return;
    e.preventDefault();
    buttons.current[to]?.focus();
    if (seeking) onSelect(to, false);
  };

  return (
    <div
      role='group'
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn('flex', variant === 'bar' ? 'gap-[3px]' : 'gap-1')}
    >
      {chapters.map((chapter, i) => {
        const item = items[i];
        const side =
          i === 0
            ? 'left-0'
            : i === items.length - 1
              ? 'right-0'
              : 'left-1/2 -translate-x-1/2';
        return (
          <div
            key={item.id}
            style={{ flexGrow: chapter.share * 1000 }}
            className='group/chapter relative min-w-0 basis-0'
          >
            <button
              type='button'
              ref={(el) => {
                buttons.current[i] = el;
              }}
              aria-label={item.label}
              aria-current={i === active ? 'true' : undefined}
              tabIndex={i === tabbable ? 0 : -1}
              onFocus={() => setStop(i)}
              onClick={(e) => onSelect(i, e.detail > 0)}
              className={cn(
                'block w-full cursor-pointer text-left',
                variant === 'bar' ? 'py-2.5 pointer-coarse:py-4' : 'py-1',
              )}
            >
              {variant === 'bar' ? (
                <Segment index={i} active={active} />
              ) : (
                <Block item={item} chapter={chapter} selected={i === active} />
              )}
            </button>
            <span
              aria-hidden='true'
              data-chapter-tip=''
              className={cn(
                'pointer-events-none absolute bottom-full z-20 mb-1 hidden w-max max-w-[min(260px,70vw)] flex-col items-start gap-1 rounded-lg bg-black/90 px-2.5 py-1.5 text-xs/[1.35] font-medium text-white shadow-lg group-focus-within/chapter:flex group-hover/chapter:flex',
                side,
              )}
            >
              {chapter.current && (
                <LiveBadge className='text-[10px]'>{current}</LiveBadge>
              )}
              <span>
                {item.company}
                <span className='text-white/70'> · {item.role}</span>
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** A thin segment: filled before the scene that plays, partly filled for it (the knob rides its end), empty after. */
function Segment({ index, active }: { index: number; active: number }) {
  const now = index === active;
  return (
    <span className='relative block h-1 rounded-full bg-white/30 transition-[height] group-focus-within/chapter:h-1.5 group-hover/chapter:h-1.5'>
      <span
        className='absolute inset-0 origin-left rounded-full bg-sm-red'
        style={{
          transform: now
            ? 'scaleX(var(--sm-cp, 0))'
            : `scaleX(${index < active ? 1 : 0})`,
        }}
      />
      {now && (
        <span
          className='absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sm-red'
          style={{ left: 'calc(var(--sm-cp, 0) * 100%)' }}
        />
      )}
    </span>
  );
}

/** A tall block of the timeline: the company, and the years of the role under it, red and pulsing for the one that is still going. */
function Block({
  item,
  chapter,
  selected,
}: {
  item: CareerBarItem;
  chapter: Chapter;
  selected: boolean;
}) {
  return (
    <span
      className={cn(
        'relative flex h-16 flex-col justify-end overflow-hidden rounded-lg px-2 pb-1.5 text-xs/[1.25] transition-colors',
        chapter.current
          ? 'bg-sm-red text-white'
          : 'bg-sm-hover2 text-sm-ink group-hover/chapter:bg-sm-mute/40',
        selected && 'outline-2 -outline-offset-2 outline-sm-blue',
      )}
    >
      {chapter.current && (
        <span
          aria-hidden='true'
          className='absolute top-2 right-2 size-[7px] animate-[sm-pulse_1.4s_infinite] rounded-full bg-white'
        />
      )}
      <span className='truncate font-medium'>{item.company}</span>
      <span
        className={cn(
          'truncate',
          chapter.current ? 'text-white/80' : 'text-sm-mute',
        )}
      >
        {item.years}
      </span>
    </span>
  );
}
