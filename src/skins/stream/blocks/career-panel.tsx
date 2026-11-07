/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Image from 'next/image';
import { homeCopy } from '@/content/copy/home';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { LiveBadge } from '@/skins/stream/ui/live-badge';
import { StreamHeading } from '@/skins/stream/ui/stream-heading';
import { StreamLink } from '@/skins/stream/ui/stream-link';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * "Where I've worked" as the chapters panel of the video: the roles, the newest first, each with its logo, company, role, period and
 * tagline; a press seeks the player to that role. The link to the full resume is in the heading. The panel says nothing when there
 * are no roles: the player beside it already shows the loading, empty and error states.
 */
export function CareerPanel({
  jobs,
  pending,
  scene,
  onSeek,
}: {
  /** the roles from the oldest to the newest, as the player plays them */
  jobs: Doc<'experience'>[];
  pending: boolean;
  scene: number;
  onSeek: (index: number) => void;
}) {
  const copy = useCopy(homeCopy);
  const { experience } = useCopy(resumeCopy);
  const { lang } = useLang();
  if (!pending && !jobs.length) return null;

  return (
    <section aria-labelledby='work-h' className='min-w-0 px-3 min-[701px]:px-0'>
      <StreamHeading
        id='work-h'
        action={<StreamLink href='/resume'>{copy.work.all}</StreamLink>}
      >
        {copy.work.title}
      </StreamHeading>
      {pending ? (
        <div aria-hidden='true' className='flex flex-col gap-2'>
          {Array.from({ length: 4 }, (_, i) => (
            <StreamSkeleton key={i} className='h-[76px]' />
          ))}
        </div>
      ) : (
        <ul className='m-0 flex list-none flex-col gap-1 p-0'>
          {jobs
            .map((job, index) => ({ job, index }))
            .reverse()
            .map(({ job, index }) => (
              <li key={job.id}>
                <button
                  type='button'
                  aria-current={index === scene ? 'true' : undefined}
                  onClick={() => onSeek(index)}
                  className={cn(
                    'flex w-full cursor-pointer gap-3 rounded-lg p-2 text-left transition-colors hover:bg-sm-hover aria-[current=true]:bg-sm-hover pointer-coarse:py-3',
                  )}
                >
                  <span className='relative block aspect-video w-[112px] flex-none overflow-hidden rounded-md bg-sm-hover2'>
                    {job.logo ? (
                      <Image
                        src={job.logo}
                        alt={job.company}
                        fill
                        sizes='112px'
                        className='object-cover'
                      />
                    ) : (
                      <span
                        aria-hidden='true'
                        className='grid size-full place-items-center text-lg font-bold'
                      >
                        {job.shortName || job.company.slice(0, 3)}
                      </span>
                    )}
                    {!job.endMonth && (
                      <LiveBadge className='absolute right-1 bottom-1 px-1.5 text-[10px]'>
                        {experience.current}
                      </LiveBadge>
                    )}
                  </span>
                  <span className='min-w-0'>
                    <span className='block text-sm/[1.3] font-medium'>
                      {job.company}
                    </span>
                    <span className='block text-xs/[1.4] text-sm-mute'>
                      {job.role}
                    </span>
                    <span className='block text-xs/[1.4] text-sm-mute'>
                      {formatPeriod(job.startMonth, job.endMonth, lang)}
                    </span>
                    {job.tagline && (
                      <span className='mt-0.5 line-clamp-3 block text-xs/[1.4] text-sm-mute'>
                        {job.tagline}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </section>
  );
}
