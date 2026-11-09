/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { GraduationCap } from 'lucide-react';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { DataMedia } from '@/skins/trade/blocks/data-media';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';
import { TvTile } from '@/skins/trade/ui/tv-tile';
import { cssVars } from '@/skins/trade/ui/css-vars';

/**
 * Education as the corporate actions of a chart site: a row for each degree with a round mark, the school and its photo, the period, the
 * major, and the thesis with its technologies and links.
 */
export function DataCorporateActions() {
  const query = useContentQuery('education');
  const { byId } = useSkills();
  const copy = useCopy(resumeCopy).education;
  const { resume } = useCopy(tradeDataCopy);
  const { lang } = useLang();
  const degrees = query.data ?? [];
  return (
    <TvDataState
      query={query}
      count={degrees.length}
      empty='education'
      subject='education'
      level={3}
      skeleton={
        <div className='grid gap-1 p-3.5'>
          {Array.from({ length: 2 }, (_, i) => (
            <TvSkeleton key={i} className='h-20' />
          ))}
        </div>
      }
      className='m-3.5'
    >
      <ul className='m-0 list-none border-t border-tv-line p-0'>
        {degrees.map((degree, index) => (
          <li
            key={degree.id}
            id={`tv-degree-${degree.id}`}
            data-testid='degree'
            style={cssVars({ '--i': index })}
            className='flex scroll-mt-3 animate-tv-slide-in flex-col gap-3 border-b border-tv-line px-3.5 py-3 transition-colors [animation-delay:calc(var(--i)*70ms)] hover:bg-tv-hover/40 min-[901px]:flex-row min-[901px]:items-start'
          >
            {degree.logo && (
              <DataMedia
                id={`degree:${degree.id}`}
                name={degree.school}
                ratio='video'
                sizes='(min-width: 901px) 200px, 60vw'
                className='w-40 flex-none min-[901px]:w-[200px]'
              />
            )}
            <div className='grid min-w-0 flex-1 gap-x-4 gap-y-2 min-[901px]:grid-cols-[150px_minmax(0,230px)_minmax(0,1fr)]'>
              <p className='flex items-start gap-2 text-xs text-tv-mute tabular-nums'>
                <TvTile tile='violet'>
                  <GraduationCap className='size-3' strokeWidth={2.2} />
                </TvTile>
                {formatPeriod(degree.startMonth, degree.endMonth, lang)}
              </p>
              <div className='min-w-0'>
                <h3 className='text-[13px] leading-snug font-semibold'>
                  {degree.degree}
                </h3>
                <p className='text-xs text-tv-mute'>{degree.school}</p>
              </div>
              <div className='min-w-0'>
                {degree.major && (
                  <p className='text-xs'>
                    <span className='text-tv-mute'>
                      {resume.education.major}:{' '}
                    </span>
                    {degree.major}
                  </p>
                )}
                {degree.thesisTitle && (
                  <div className='mt-2 max-w-[680px] rounded border border-tv-line bg-tv-panel px-3 py-2.5'>
                    <TvChip tone='accent'>{copy.thesis}</TvChip>
                    <p className='mt-1.5 text-[13px] leading-snug font-semibold'>
                      {degree.thesisTitle}
                    </p>
                    <DataTags
                      skills={degree.technologies.flatMap(
                        (id) => byId.get(id) ?? [],
                      )}
                      className='mt-2'
                    />
                    {(degree.thesisUrl || degree.thesisSourceUrl) && (
                      <div className='mt-2 flex flex-wrap gap-x-3.5 gap-y-1'>
                        {[
                          [degree.thesisUrl, copy.readThesis],
                          [degree.thesisSourceUrl, copy.sourceCode],
                        ].map(
                          ([href, label]) =>
                            href && (
                              <a
                                key={label}
                                href={href}
                                target='_blank'
                                rel='noopener noreferrer'
                                data-slot='tv-link'
                                className='inline-flex font-medium text-tv-accent-ink underline-offset-[3px] hover:underline pointer-coarse:min-h-11 pointer-coarse:items-center'
                              >
                                {label}
                              </a>
                            ),
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </TvDataState>
  );
}
