/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { MapPin } from 'lucide-react';
import { BrandIcon } from '@/components/brand-icon';
import { homeCopy } from '@/content/copy/home';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { DeskSection } from '@/skins/trade/blocks/desk-section';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvEmailRow } from '@/skins/trade/ui/tv-email-row';
import { TvLinkGroups } from '@/skins/trade/ui/tv-link-groups';
import { TvLinkRow } from '@/skins/trade/ui/tv-link-row';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/**
 * The links of the symbol page: the email as the joined Email + Copy control, the phone and the place, then the Professional, Messaging and Social links, the
 * same data and groups as the Standard Connect menu. The section is the `#contact` anchor of the page.
 */
export function DeskAboutLinks() {
  const title = useCopy(homeCopy).contact.title;
  const query = useContentQuery('contacts');
  const contacts = query.data ?? [];
  const { data: profile } = useProfileQuery();
  const email = contacts.find((c) => c.kind === 'email');
  const phone = contacts.find((c) => c.kind === 'phone');
  const social = contacts.filter((c) => c.kind === 'social' && c.url);

  return (
    <DeskSection id='tv-links' anchor='contact' title={title}>
      <TvDataState
        query={query}
        count={contacts.length}
        empty='contact'
        subject='contact'
        level={3}
        skeleton={
          <div className='grid gap-2'>
            <TvSkeleton className='h-10' />
            <TvSkeleton className='h-10' />
            <TvSkeleton className='h-10' />
          </div>
        }
      >
        {email && <TvEmailRow email={email} className='mb-2' />}
        {phone && (
          <TvLinkRow
            href={phone.url}
            icon={<BrandIcon platform='phone' />}
            title={<span className='tabular-nums'>{phone.label}</span>}
          />
        )}
        {profile?.location && (
          <TvLinkRow icon={<MapPin />} title={profile.location} />
        )}
        <div className='mt-2'>
          <TvLinkGroups contacts={social} />
        </div>
      </TvDataState>
    </DeskSection>
  );
}
