/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LoadingBlock } from '@/components/loading-block';
import { commonCopy } from '@/content/copy/common';
import { phoneHomeCopy } from '@/content/copy/phone-home';
import { resumeCopy } from '@/content/copy/resume';
import { useNow } from '@/hooks/use-now';
import { shell } from '@/lib/content/shell';
import { careerFacts } from '@/lib/derive/career-facts';
import { offeredLanguages } from '@/lib/derive/offered-languages';
import { yearsPhrase } from '@/lib/derive/years-phrase';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery, useProfileQuery } from '@/lib/query/use-content';
import { AboutFactsSkeleton } from '@/skins/phone/blocks/about-facts-skeleton';
import { FactRow } from '@/skins/phone/blocks/fact-row';
import { skillHue } from '@/skins/phone/blocks/skill-hue';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhChip } from '@/skins/phone/ui/ph-chip';
import { PhSection } from '@/skins/phone/ui/ph-section';

/**
 * The facts list ("About this device"): only what the site really has. The company, the years in software, the first role and the areas
 * come from the roles and the skills (`careerFacts`), the place from the profile and the languages from the ones the site offers; a fact
 * with no data is not a row.
 */
export function AboutFacts() {
  const copy = useCopy(phoneHomeCopy).about.facts;
  const common = useCopy(commonCopy);
  const groups = useCopy(resumeCopy).skills.groups;
  const { lang } = useLang();
  const now = useNow();
  const experience = useContentQuery('experience');
  const skills = useContentQuery('skills');
  const { data: profile } = useProfileQuery();

  const found = careerFacts(experience.data ?? [], skills.data ?? [], now);
  const languages = offeredLanguages(shell.languages).map((code) =>
    code === 'vi' ? common.language.vietnamese : common.language.english,
  );

  if (experience.isPending || skills.isPending)
    return (
      <PhSection title={copy.title} className='mt-0'>
        <LoadingBlock>
          <AboutFactsSkeleton />
        </LoadingBlock>
      </PhSection>
    );

  return (
    <PhSection title={copy.title} className='mt-0'>
      <PhCard className='p-0'>
        <dl className='m-0'>
          {found.current && (
            <FactRow label={copy.company}>{found.current.company}</FactRow>
          )}
          {profile?.location && (
            <FactRow label={copy.location}>{profile.location}</FactRow>
          )}
          {found.years !== null && (
            <FactRow label={copy.experience}>
              {yearsPhrase(found.years, lang)}
            </FactRow>
          )}
          {found.first && (
            <FactRow label={copy.firstRole}>
              {found.first.year}
              <span className='block font-normal text-ph-mute'>
                {found.first.role}, {found.first.company}
              </span>
            </FactRow>
          )}
          {found.areas.length > 0 && (
            <FactRow label={copy.areas}>
              <span className='flex flex-wrap gap-1.5'>
                {found.areas.map((area) => (
                  <PhChip
                    key={area}
                    hue={skillHue(area)}
                    className='h-7 px-3 text-[13px]'
                  >
                    {groups[area]}
                  </PhChip>
                ))}
              </span>
            </FactRow>
          )}
          {languages.length > 0 && (
            <FactRow label={copy.languages}>{languages.join(', ')}</FactRow>
          )}
        </dl>
      </PhCard>
    </PhSection>
  );
}
