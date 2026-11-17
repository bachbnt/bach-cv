/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { LoadingBlock } from '@/components/loading-block';
import { homeCopy } from '@/content/copy/home';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { fill } from '@/lib/chat/fill';
import { stripSkills } from '@/lib/derive/skill-strip';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
import type { CssVars } from '@/skins/phone/blocks/css-vars';
import { foldOf, type Fold } from '@/skins/phone/blocks/tech-fold';
import '@/skins/phone/css/stats.css';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';

/** The widths of the chips of the strip as the seed has it, so the card wraps into the rows of the loaded one. */
const WIDTHS = [
  'w-16',
  'w-14',
  'w-36',
  'w-20',
  'w-14',
  'w-18',
  'w-12',
  'w-17',
  'w-14',
  'w-28',
  'w-20',
  'w-21',
  'w-17',
  'w-38',
  'w-20',
  'w-18',
  'w-17',
  'w-19',
  'w-24',
  'w-19',
] as const;

/** How many rows of chips show while the list is folded. */
const ROWS = 3;

/**
 * The technologies of Standard's strip as a card of chips, here with all the listed skills (mobile first, as the strip orders them, so the
 * ones the strip shows come first), folded to its first rows with a soft fade and a button that opens the rest. The chips that are folded
 * away can neither be reached by the keyboard nor read (`inert`), and a list of `ROWS` rows or fewer has no button. A list that cannot be read or
 * is empty leaves the card out, as the strip does.
 */
export function HomeSkills() {
  const copy = useCopy(homeCopy);
  const words = useCopy(phoneHomeCopy).home;
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = stripSkills(skills, Infinity);
  const list = useRef<HTMLUListElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const [fold, setFold] = useState<Fold | null>(null);
  const [full, setFull] = useState(0);
  const [open, setOpen] = useState(false);
  const count = shown.length;
  const sizes: CssVars = {
    '--ph-fold-h': `${fold?.height ?? 0}px`,
    '--ph-full-h': `${full}px`,
  };

  // where the chips wrap, measured from the list as it is laid out whole: again when its width changes or the chips do
  useLayoutEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const measure = () => {
      const boxes = Array.from(ul.children, (chip) =>
        chip instanceof HTMLElement
          ? { top: chip.offsetTop, height: chip.offsetHeight }
          : { top: 0, height: 0 },
      );
      setFold(foldOf(boxes, ROWS));
      setFull(ul.scrollHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(ul);
    return () => observer.disconnect();
  }, [count]);

  if (isPending)
    return (
      <LoadingBlock>
        <HomeGlass>
          <HomeCardHead id='ph-tech-h' title={copy.technologies} />
          <div className='flex max-h-[6.25rem] flex-wrap gap-2 overflow-hidden'>
            {WIDTHS.map((width, index) => (
              <PhSkeleton key={index} className={cn('h-7', width)} />
            ))}
          </div>
        </HomeGlass>
      </LoadingBlock>
    );
  if (!shown.length) return null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // folding from far down the list leaves the button below the new end of the card: bring it back (the scroll padding keeps it clear of the bars)
    if (!next)
      window.setTimeout(
        () => button.current?.scrollIntoView({ block: 'nearest' }),
        window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 300,
      );
  };

  return (
    <HomeGlass as='section' aria-labelledby='ph-tech-h'>
      <HomeCardHead id='ph-tech-h' title={copy.technologies} />
      <div
        id='ph-tech-list'
        className='ph-fold'
        data-fold={fold ? '' : undefined}
        data-open={open}
        style={sizes}
      >
        <ul
          ref={list}
          className='relative m-0 flex list-none flex-wrap gap-2 p-0'
        >
          {shown.map((skill, index) => (
            <li
              key={skill.id}
              inert={fold !== null && !open && index >= fold.hiddenFrom}
            >
              <PhChip
                hue={skillHue(skill.category)}
                className='h-7 px-3 text-[14px]'
              >
                {skill.name}
              </PhChip>
            </li>
          ))}
        </ul>
      </div>
      {fold && (
        <button
          ref={button}
          type='button'
          aria-expanded={open}
          aria-controls='ph-tech-list'
          onClick={toggle}
          className='mt-1 -mb-2 inline-flex min-h-11 cursor-pointer items-center text-[14.5px] font-semibold text-ph-accent-ink'
        >
          {open ? words.techShowLess : fill(words.techShowAll, { count })}
        </button>
      )}
    </HomeGlass>
  );
}
