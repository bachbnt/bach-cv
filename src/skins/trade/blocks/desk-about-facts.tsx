/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState, type ReactNode } from 'react';
import { commonCopy } from '@/content/copy/common';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { DeskCountUp } from '@/skins/trade/blocks/desk-count-up';
import { deskFacts } from '@/skins/trade/blocks/desk-facts';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

function Fact({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'min-w-0 rounded border border-tv-line bg-tv-bg px-3 py-2.5',
        className,
      )}
    >
      <dt className='text-[11px] text-tv-mute'>{label}</dt>
      <dd className='mt-1 text-[15px]/snug font-semibold [overflow-wrap:anywhere]'>
        {children}
      </dd>
    </div>
  );
}

/**
 * The key facts grid of a symbol: only facts the site really has (where I live, the languages the site offers, the years in software and the
 * areas of my skills, the first job, the current role and company). The years count up once when the grid is first seen.
 */
export function DeskAboutFacts() {
  const copy = useCopy(tradeDeskCopy).about;
  const facts = copy.facts;
  const common = useCopy(commonCopy);
  const groups = useCopy(resumeCopy).skills.groups;
  const [now] = useState(() => new Date());
  const experience = useContentQuery('experience');
  const skills = useContentQuery('skills');
  const { data: profile } = useProfileQuery();

  const found = deskFacts(experience.data ?? [], skills.data ?? [], now);
  const languages = shell.languages.map((lang) =>
    lang === 'vi' ? common.language.vietnamese : common.language.english,
  );
  const pending = experience.isPending || skills.isPending;

  return (
    <DeskSection id='tv-facts' title={facts.title} bodyClassName='@container'>
      {pending ? (
        <div
          aria-hidden='true'
          className='grid grid-cols-2 gap-2 @[560px]:grid-cols-4'
        >
          {Array.from({ length: 4 }, (_, i) => (
            <TvSkeleton key={i} className='h-16' />
          ))}
        </div>
      ) : (
        <dl className='m-0 grid grid-cols-2 gap-2 @[560px]:grid-cols-4'>
          {profile?.location && (
            <Fact label={facts.location}>{profile.location}</Fact>
          )}
          {languages.length > 0 && (
            <Fact label={facts.languages}>{languages.join(' · ')}</Fact>
          )}
          {found.years !== null && (
            <Fact label={facts.years}>
              <span className='text-[26px]/none text-tv-up tabular-nums'>
                <DeskCountUp value={found.years} />
              </span>{' '}
              <small className='text-xs font-normal text-tv-mute'>
                {found.years === 1 ? facts.yearsOne : facts.yearsMany}
              </small>
            </Fact>
          )}
          {found.first && (
            <Fact label={facts.firstRole}>
              <span className='tabular-nums'>{found.first.year}</span>
              <span className='block text-xs font-normal text-tv-mute'>
                {found.first.role}, {found.first.company}
              </span>
            </Fact>
          )}
          {found.current && (
            <>
              <Fact label={facts.role}>{found.current.role}</Fact>
              <Fact label={facts.company}>{found.current.company}</Fact>
            </>
          )}
          {found.areas.length > 0 && (
            <Fact label={facts.areas} className='col-span-2'>
              <span className='flex flex-wrap gap-1.5'>
                {found.areas.map((area) => (
                  <TvChip key={area} tone={area}>
                    {groups[area]}
                  </TvChip>
                ))}
              </span>
            </Fact>
          )}
        </dl>
      )}
    </DeskSection>
  );
}
