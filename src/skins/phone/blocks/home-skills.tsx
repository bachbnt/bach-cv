/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LoadingBlock } from '@/components/loading-block';
import { homeCopy } from '@/content/copy/home';
import { stripSkills } from '@/lib/derive/skill-strip';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { HomeCardHead } from '@/skins/phone/blocks/home-card-head';
import { HomeGlass } from '@/skins/phone/blocks/home-glass';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
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

/**
 * The technologies strip of Standard as a card of chips: the listed skills, mobile first, at most as many as the strip shows. A list that
 * cannot be read or is empty leaves the card out, as the strip does.
 */
export function HomeSkills() {
  const copy = useCopy(homeCopy);
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = stripSkills(skills);

  if (isPending)
    return (
      <LoadingBlock>
        <HomeGlass>
          <HomeCardHead id='ph-tech-h' title={copy.technologies} />
          <div className='flex flex-wrap gap-2'>
            {WIDTHS.map((width, index) => (
              <PhSkeleton key={index} className={cn('h-7', width)} />
            ))}
          </div>
        </HomeGlass>
      </LoadingBlock>
    );
  if (!shown.length) return null;

  return (
    <HomeGlass as='section' aria-labelledby='ph-tech-h'>
      <HomeCardHead id='ph-tech-h' title={copy.technologies} />
      <ul className='m-0 flex list-none flex-wrap gap-2 p-0'>
        {shown.map((skill) => (
          <li key={skill.id}>
            <PhChip
              hue={skillHue(skill.category)}
              className='h-7 px-3 text-[14px]'
            >
              {skill.name}
            </PhChip>
          </li>
        ))}
      </ul>
    </HomeGlass>
  );
}
