/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { aboutCopy } from '@/content/copy/about';
import { tradeDeskCopy } from '@/content/copy/trade-desk';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { DeskSection } from '@/skins/trade/blocks/desk-section';

/** A frame the photo fills: the photo's own width and height are never overridden by CSS. */
const FRAME =
  'group/photo relative aspect-[3/4] overflow-hidden rounded border border-tv-line bg-tv-bg';
const PHOTO =
  'object-cover transition-transform duration-300 ease-tv-out group-hover/photo:scale-105';

/** The three photos (my portrait and the two covers) as a strip of thumbnails, like the media of a symbol page. */
export function DeskAboutMedia() {
  const copy = useCopy(aboutCopy);
  const title = useCopy(tradeDeskCopy).about.photos;
  const { data: profile } = useProfileQuery();
  const covers = (profile?.covers ?? []).slice(0, 2);
  if (!shell.avatar && covers.length === 0) return null;

  return (
    <DeskSection id='tv-media' title={title}>
      <div className='grid grid-cols-3 gap-2'>
        {shell.avatar && (
          <div className={FRAME}>
            <Image
              src={shell.avatar}
              alt={`${copy.avatarAlt} ${shell.name}`}
              fill
              sizes='160px'
              unoptimized
              className={PHOTO}
            />
          </div>
        )}
        {covers.map((cover, i) => (
          <div key={i} className={FRAME}>
            <Image
              src={cover}
              alt={`${copy.coverAlt} ${shell.name}`}
              fill
              sizes='160px'
              unoptimized
              className={PHOTO}
            />
          </div>
        ))}
      </div>
    </DeskSection>
  );
}
