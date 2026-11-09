/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { aboutCopy } from '@/content/copy/about';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { DevChip } from '@/skins/dev/ui/dev-chip';
import { visibleSpecialties } from '@/lib/derive/specialties';

/** the photos are frames the pictures fill */
const PHOTO =
  'group/photo relative min-h-0 overflow-hidden rounded-[8px] border border-line-2 transition-colors duration-300 hover:border-signal';
/** the picture zooms a little, slowly, under the mouse (inside its frame) */
const PICTURE =
  'object-cover object-[50%_28%] transition-transform duration-[600ms] ease-out motion-safe:group-hover/photo:scale-[1.05]';

/** Under the page title: the profile summary with the specialties, and the photo grid beside them. */
export function AboutHead() {
  const copy = useCopy(aboutCopy);
  const { data: profile } = useProfileQuery();
  const specialties = visibleSpecialties(profile);
  const [top, bottom] = profile?.covers ?? [];

  return (
    <div
      className='mt-2 grid grid-cols-[1.1fr_1fr] items-start gap-[26px] max-[900px]:grid-cols-1'
      data-reveal
    >
      <div>
        {profile?.summary && (
          <p className='mb-[18px] max-w-[640px] font-sans text-[17px] leading-[1.65] font-normal text-ink'>
            {profile.summary}
          </p>
        )}
        {specialties.length > 0 && (
          <ul className='mt-1.5 flex flex-wrap gap-[7px] p-0'>
            {specialties.map((s) => (
              <li key={s.name}>
                <DevChip tone={s.tone === 'primary' ? 'tools' : s.tone}>
                  {s.name}
                </DevChip>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className='grid h-[380px] grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] grid-rows-[minmax(0,1fr)_minmax(0,1fr)] gap-3 overflow-hidden max-[900px]:h-[300px]'>
        {shell.avatar && (
          <div className={cn(PHOTO, 'row-[1/3]')}>
            <Image
              src={shell.avatar}
              alt={`${copy.avatarAlt} ${shell.name}`}
              fill
              sizes='(min-width: 901px) 340px, 60vw'
              priority
              className={PICTURE}
            />
          </div>
        )}
        {[top, bottom].map(
          (src) =>
            src && (
              <div key={src} className={PHOTO}>
                <Image
                  src={src}
                  alt={`${copy.coverAlt} ${shell.name}`}
                  fill
                  sizes='(min-width: 901px) 240px, 40vw'
                  className={PICTURE}
                />
              </div>
            ),
        )}
      </div>
    </div>
  );
}
