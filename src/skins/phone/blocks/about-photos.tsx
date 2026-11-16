/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { LoadingBlock } from '@/components/loading-block';
import { aboutCopy } from '@/content/copy/about';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { useScreenSizes } from '@/skins/phone/blocks/use-screen-sizes';
import { PhSection } from '@/skins/phone/ui/ph-section';
import { PhSkeleton } from '@/skins/phone/ui/ph-skeleton';

const PHOTOS_GRID = 'grid grid-cols-2 gap-3';
const PHOTO_TILE = 'aspect-[4/5] overflow-hidden rounded-ph-panel';

/** The two covers of the profile, the pictures Standard puts beside the portrait; the portrait itself is in the card of the head. */
export function AboutPhotos() {
  const copy = useCopy(aboutCopy);
  const words = useCopy(phoneHomeCopy).about;
  const { data: profile, isPending } = useProfileQuery();
  const covers = profile?.covers ?? [];
  const sizes = useScreenSizes(240, 2, 12);
  if (isPending)
    return (
      <LoadingBlock>
        <PhSection title={words.photos} className='mt-0'>
          <div aria-hidden='true' className={PHOTOS_GRID}>
            {[0, 1].map((tile) => (
              <PhSkeleton key={tile} className={cn('h-auto', PHOTO_TILE)} />
            ))}
          </div>
        </PhSection>
      </LoadingBlock>
    );
  if (covers.length === 0) return null;

  return (
    <PhSection title={words.photos} className='mt-0'>
      <ul className={cn('m-0 list-none p-0', PHOTOS_GRID)}>
        {covers.slice(0, 2).map((cover) => (
          <li
            key={cover}
            className={cn('relative bg-ph-sheet-3 shadow-ph-card', PHOTO_TILE)}
          >
            <Image
              src={cover}
              alt={`${copy.coverAlt} ${shell.name}`}
              fill
              sizes={sizes}
              className='object-cover'
            />
          </li>
        ))}
      </ul>
    </PhSection>
  );
}
