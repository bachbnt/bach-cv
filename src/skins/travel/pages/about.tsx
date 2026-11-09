/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { visibleSpecialties } from '@/lib/derive/specialties';
import { Route } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { aboutCopy } from '@/content/copy/about';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useProfileQuery } from '@/lib/query/use-content';
import { TripLuggage } from '@/skins/travel/blocks/trip-luggage';
import { TlButtonLink } from '@/skins/travel/ui/tl-button';
import { TlChip } from '@/skins/travel/ui/tl-chip';
import { PlacesList } from '@/skins/travel/blocks/places-list';
import { TlKicker } from '@/skins/travel/ui/tl-kicker';
import { TlPage } from '@/skins/travel/ui/tl-page';
import { TlPanel } from '@/skins/travel/ui/tl-panel';

const TONE_STOP = { primary: 3, mobile: 6, web: 1, ai: 5 } as const;

/**
 * The traveller: the Standard About page (the portrait and photos, the summary, the specialties) as a traveller's card with photos
 * from the road, and the core stack as the packing list with Standard's link to all the skills (on the Resume page).
 */
export function AboutPage() {
  const copy = useCopy(aboutCopy);
  const words = useCopy(travelTripCopy).about;
  const { data: profile } = useProfileQuery();
  const specialties = visibleSpecialties(profile);
  const photos = profile?.covers ?? [];
  return (
    <TlPage page='about'>
      <TlPanel side='left' labelledBy='tl-about-title'>
        <div className='grid grid-cols-1 gap-5 p-4 pt-2 md:p-5'>
          <header className='flex items-center gap-3.5'>
            {shell.avatar && (
              <span className='relative size-20 flex-none overflow-hidden rounded-2xl border-[3px] border-tl-solid shadow-tl-avatar'>
                <Image
                  src={shell.avatar}
                  alt={`${copy.avatarAlt} ${shell.name}`}
                  fill
                  sizes='80px'
                  priority
                  className='object-cover object-[50%_35%]'
                />
              </span>
            )}
            <div className='min-w-0'>
              <TlKicker>{words.passport}</TlKicker>
              <h1
                id='tl-about-title'
                className='m-0 text-[26px]/[1.1] font-extrabold tracking-[-0.4px]'
              >
                {copy.title}
              </h1>
              <p className='m-0 text-[13px] font-semibold text-tl-muted'>
                {words.holder}: {profile?.fullName || shell.name}
              </p>
            </div>
          </header>
          {profile?.summary && (
            <p className='m-0 text-[15px]/[1.55] text-tl-muted'>
              {profile.summary}
            </p>
          )}
          {specialties.length > 0 && (
            <ul className='m-0 flex list-none flex-wrap gap-2 p-0'>
              {specialties.map((s) => (
                <li key={s.name}>
                  <TlChip
                    color={TONE_STOP[s.tone]}
                    className='px-3 py-1.5 text-[13px]'
                  >
                    {s.name}
                  </TlChip>
                </li>
              ))}
            </ul>
          )}
          {photos.length > 0 && (
            <ul className='m-0 grid list-none grid-cols-2 gap-2.5 p-0'>
              {photos.slice(0, 2).map((src, i) => (
                <li
                  key={src}
                  className={`relative h-28 overflow-hidden rounded-xl bg-tl-chip ${i % 2 ? 'rotate-[1.5deg]' : '-rotate-[1.5deg]'} border-4 border-tl-solid shadow-tl-card`}
                >
                  <Image
                    src={src}
                    alt={`${copy.coverAlt} ${shell.name}`}
                    fill
                    sizes='200px'
                    className='object-cover'
                  />
                </li>
              ))}
            </ul>
          )}
          <section aria-labelledby='tl-core'>
            <div className='mb-2 flex flex-wrap items-baseline justify-between gap-2'>
              <h2 id='tl-core' className='m-0 text-[17px] font-extrabold'>
                {copy.core.title} · {words.packing}
              </h2>
              <Link
                href='/resume#skills'
                className='text-sm font-bold underline underline-offset-4 pointer-coarse:inline-flex pointer-coarse:min-h-11 pointer-coarse:items-center'
              >
                {copy.core.all}
              </Link>
            </div>
            <p className='m-0 mb-2 text-[13px] text-tl-muted'>
              {copy.core.lead}
            </p>
            <TripLuggage coreOnly />
          </section>
          <PlacesList />
          <TlButtonLink
            href='/resume'
            variant='solid'
            className='justify-self-start'
          >
            <Route aria-hidden='true' />
            {words.seeTrip}
          </TlButtonLink>
        </div>
      </TlPanel>
    </TlPage>
  );
}
