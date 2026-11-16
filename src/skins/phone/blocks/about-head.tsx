/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { aboutCopy } from '@/content/copy/about';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { localize } from '@/lib/content/schema';
import { shell } from '@/lib/content/shell';
import { currentJob } from '@/lib/derive/current-job';
import { visibleSpecialties } from '@/lib/derive/specialties';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { AboutHeadSkeleton } from '@/skins/phone/blocks/about-head-skeleton';
import { OwnerAvatar } from '@/skins/phone/blocks/owner-avatar';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { PhSection } from '@/skins/phone/ui/ph-section';

/**
 * The head of About: the card of the owner of the device (photo, name and role), the summary of the profile and the specialties as chips.
 * The role is the one that is not over; when the roles are not read, or none is current, it is the headline of the site.
 */
export function AboutHead() {
  const copy = useCopy(aboutCopy);
  const words = useCopy(phoneHomeCopy).about;
  const { lang } = useLang();
  const { data: profile, isPending } = useProfileQuery();
  const { data: jobs } = useContentQuery('experience');
  const role = currentJob(jobs ?? [])?.role ?? localize(shell, lang).headline;
  const specialties = visibleSpecialties(profile);

  return (
    <>
      <PhCard className='flex items-center gap-4 p-4'>
        <OwnerAvatar
          alt={`${copy.avatarAlt} ${shell.name}`}
          pixels={160}
          className='size-20 text-[26px]'
        />
        <div className='min-w-0'>
          <p className='text-[22px]/[1.2] font-bold tracking-[-0.01em] [overflow-wrap:anywhere]'>
            {shell.name}
          </p>
          {role && (
            <p className='mt-1 text-[15px]/[1.4] text-ph-mute'>{role}</p>
          )}
        </div>
      </PhCard>
      {isPending ? (
        <AboutHeadSkeleton />
      ) : (
        profile?.summary && (
          <p className='px-1 text-[16px]/[1.65]'>{profile.summary}</p>
        )
      )}
      {specialties.length > 0 && (
        <PhSection title={words.specialties} className='mt-0'>
          <ul className='m-0 flex list-none flex-wrap gap-2 p-0'>
            {specialties.map((specialty) => (
              <li key={specialty.name}>
                <PhChip
                  tone={specialty.tone === 'primary' ? 'accent' : 'plain'}
                  className='h-8 px-3.5 text-[14px]'
                >
                  {specialty.name}
                </PhChip>
              </li>
            ))}
          </ul>
        </PhSection>
      )}
    </>
  );
}
