/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  BriefcaseBusiness,
  CalendarDays,
  Languages,
  MapPin,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { commonCopy } from '@/content/copy/common';
import { streamChannelCopy } from '@/content/copy/stream-channel';
import { shell } from '@/lib/content/shell';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import {
  careerFacts,
  siteLanguageNames,
} from '@/skins/stream/blocks/channel-facts';

/** One line of the panel: a mark, what it is (small) and its value. */
function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className='flex items-center gap-3 py-2'>
      <Icon aria-hidden='true' className='size-5 flex-none text-sm-mute' />
      <div className='min-w-0'>
        <dt className='text-xs text-sm-mute'>{label}</dt>
        <dd className='text-sm font-medium'>{value}</dd>
      </div>
    </div>
  );
}

/**
 * The Details of the About panel, all of it read from the data: where I am (the location of the Connect menu), the year of my first
 * role, the years in software from then on, and the languages the site offers. A fact whose data is not there is left out.
 */
export function ChannelDetails() {
  const { about } = useCopy(streamChannelCopy);
  const { language } = useCopy(commonCopy);
  const { data: profile } = useProfileQuery();
  const { data: experience = [] } = useContentQuery('experience');
  // `now` only has to be right to the year, and it is read once so a re-render never changes the text
  const [now] = useState(() => new Date());
  const career = careerFacts(
    experience.map((job) => job.startMonth),
    now,
  );
  const languages = siteLanguageNames(shell.languages, {
    en: language.english,
    vi: language.vietnamese,
  });

  return (
    <section
      aria-labelledby='details-h'
      className='border-t border-sm-line pt-6'
    >
      <h2 id='details-h' className='mb-2 text-lg/[1.3] font-bold'>
        {about.details}
      </h2>
      <dl className='m-0 grid gap-x-6 min-[701px]:grid-cols-2'>
        {profile?.location && (
          <Fact icon={MapPin} label={about.location} value={profile.location} />
        )}
        {career && (
          <Fact icon={CalendarDays} label={about.since} value={career.since} />
        )}
        {career && career.years > 0 && (
          <Fact
            icon={BriefcaseBusiness}
            label={about.years}
            value={about.yearsValue(career.years)}
          />
        )}
        {languages.length > 0 && (
          <Fact
            icon={Languages}
            label={about.languages}
            value={languages.join(', ')}
          />
        )}
      </dl>
    </section>
  );
}
