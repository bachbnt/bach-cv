/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { Tag } from '@/components/tag';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { visibleSpecialties } from '@/lib/derive/specialties';

/**
 * The top of the symbol page: my name as the symbol with the headline and the specialty tags (the sector and industry of a symbol), and the
 * description, which is the profile summary.
 */
export function DeskAboutSymbol() {
  const copy = useCopy(tradeDeskCopy).about;
  const { lang } = useLang();
  const { data: profile } = useProfileQuery();
  const specialties = visibleSpecialties(profile);

  return (
    <>
      <header className='flex items-center gap-3 rounded-md border border-tv-line bg-tv-panel p-3'>
        {shell.avatar && (
          <Image
            src={shell.avatar}
            alt=''
            width={56}
            height={56}
            unoptimized
            className='size-14 flex-none rounded-full border border-tv-line object-cover object-[50%_25%]'
          />
        )}
        <div className='min-w-0'>
          <p
            aria-hidden='true'
            className='text-[10px] font-bold tracking-wider text-tv-dim uppercase'
          >
            {copy.symbol}
          </p>
          <p className='text-xl/tight font-bold'>{shell.name}</p>
          <p className='text-[13px] text-tv-mute'>
            {localize(shell, lang).headline}
          </p>
        </div>
      </header>
      {(profile?.summary || specialties.length > 0) && (
        <DeskSection id='tv-desc' title={copy.description}>
          {profile?.summary && (
            <p className='max-w-[680px] text-sm/[1.65]'>{profile.summary}</p>
          )}
          {specialties.length > 0 && (
            <ul
              className={cn(
                'm-0 flex list-none flex-wrap gap-1.5 p-0',
                profile?.summary && 'mt-3',
              )}
            >
              {specialties.map((s) => (
                <li key={s.name}>
                  <Tag
                    tone={s.tone === 'primary' ? 'neutral' : s.tone}
                    className={cn(
                      'rounded px-2.5 py-0.5 text-xs font-semibold',
                      s.tone === 'primary' && 'bg-tv-accent text-white',
                    )}
                  >
                    {s.name}
                  </Tag>
                </li>
              ))}
            </ul>
          )}
        </DeskSection>
      )}
    </>
  );
}
