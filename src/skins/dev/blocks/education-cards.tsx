/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { useSkills } from '@/components/skills/use-skills';
import { devResumeCopy } from '@/content/copy/dev-resume-certificates';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { COVER, COVER_IMAGE } from '@/skins/dev/blocks/cover-styles';
import { DevKeyBox } from '@/skins/dev/blocks/key-box';
import { DevSkillChipList } from '@/skins/dev/blocks/skill-chip-list';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevCard } from '@/skins/dev/ui/dev-card';
import { DevKind } from '@/skins/dev/ui/dev-kind';
import { DevLink } from '@/skins/dev/ui/dev-link';

/** Degrees as cards: photo, school, period, major, and the thesis with its technologies and links. */
export function DevEducationCards({
  degrees,
}: {
  degrees: Doc<'education'>[];
}) {
  const { byId } = useSkills();
  const copy = useCopy(resumeCopy).education;
  const dev = useCopy(devResumeCopy).degree;
  const { lang } = useLang();

  return (
    <div className='grid grid-cols-[repeat(2,1fr)] gap-3.5 max-[620px]:grid-cols-[1fr]'>
      {degrees.map((degree) => (
        <DevCard
          as='article'
          key={degree.id}
          data-slot='dev-degree'
          className='overflow-hidden p-0'
          data-reveal
        >
          {degree.logo && (
            <div
              data-slot='dev-cover'
              className={cn(COVER, 'aspect-[21/9] cursor-default')}
            >
              <Image
                src={degree.logo}
                alt={`${degree.degree}, ${degree.school}`}
                fill
                sizes='(min-width: 901px) 520px, 100vw'
                className={COVER_IMAGE}
              />
            </div>
          )}
          <div className='px-[18px] pt-3.5 pb-[18px]'>
            <div
              className='mb-1.5 flex items-center font-code text-[12.5px] leading-[normal] font-normal'
              aria-hidden='true'
            >
              <DevIcon name='tag' className='mr-1.5 size-[13px] text-dim' />
              <span className='text-gold'>
                v{(degree.endMonth || degree.startMonth).slice(0, 4)}
              </span>
              <span className='ml-2 text-signal'>
                {degree.endMonth
                  ? `(tag: ${dev.graduated})`
                  : `(HEAD → ${dev.studying})`}
              </span>
            </div>
            <h3 className='mb-1.5 text-[16px]'>{degree.degree}</h3>
            <p className='text-[14px] text-mute'>{degree.school}</p>
            <p className='font-code text-[14px] leading-[normal] font-normal text-mute'>
              {formatPeriod(degree.startMonth, degree.endMonth, lang)}
              {degree.major && ` · ${degree.major}`}
            </p>
            {degree.thesisTitle && (
              <DevKeyBox>
                <DevKind>{copy.thesis}</DevKind>
                <h4 className='text-[15px]'>{degree.thesisTitle}</h4>
                <DevSkillChipList
                  ids={degree.technologies}
                  skills={byId}
                  className='mt-2.5'
                />
                {(degree.thesisUrl || degree.thesisSourceUrl) && (
                  <div className='mt-3 flex flex-wrap items-center gap-x-4 gap-y-2'>
                    {[
                      [degree.thesisUrl, copy.readThesis],
                      [degree.thesisSourceUrl, copy.sourceCode],
                    ].map(
                      ([href, label]) =>
                        href && (
                          <DevLink
                            key={label}
                            href={href}
                            target='_blank'
                            rel='noopener'
                          >
                            {label}
                            <DevIcon name='link-external' className='size-3' />
                          </DevLink>
                        ),
                    )}
                  </div>
                )}
              </DevKeyBox>
            )}
          </div>
        </DevCard>
      ))}
    </div>
  );
}
