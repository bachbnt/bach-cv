/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronRight } from 'lucide-react';
import { resumeCopy } from '@/content/copy/resume';
import type { Doc } from '@/lib/content/schema';
import { isCurrent } from '@/lib/derive/current-job';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { ROW_SEPARATOR } from '@/skins/phone/blocks/list-row';
import { ResumeRoleMark } from '@/skins/phone/blocks/resume-role-mark';
import { PhCard } from '@/skins/phone/ui/ph-card';
import { PhChip } from '@/skins/phone/ui/ph-chip';

/**
 * The roles as the list of an app (every visible role, the one that is not over first, as Standard orders them). A tap shows the role: on a
 * tablet in the pane next to the list (the one shown is marked), on a phone in a screen of its own.
 */
export function ResumeRoleList({
  jobs,
  shown,
  onSelect,
}: {
  jobs: Doc<'experience'>[];
  /** the role that is on show (on a tablet it is always one) */
  shown: string | undefined;
  onSelect: (id: string) => void;
}) {
  const copy = useCopy(resumeCopy).experience;
  const { lang } = useLang();
  return (
    <PhCard className='overflow-hidden p-0'>
      <ul className='m-0 list-none p-0'>
        {jobs.map((job) => {
          const active = job.id === shown;
          return (
            <li key={job.id} className={cn(ROW_SEPARATOR, '[--inset:78px]')}>
              <button
                id={`role-${job.id}`}
                type='button'
                aria-current={active ? 'true' : undefined}
                aria-controls='ph-role-detail'
                onClick={() => onSelect(job.id)}
                className={cn(
                  'relative flex min-h-[76px] w-full scroll-mt-2 cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left transition-[background-color] duration-100 hover:bg-ph-sheet-3 active:bg-ph-sheet-3',
                  active &&
                    '@min-[900px]:bg-ph-sheet-3 @min-[900px]:before:absolute @min-[900px]:before:inset-y-3 @min-[900px]:before:left-0 @min-[900px]:before:w-[3px] @min-[900px]:before:rounded-full @min-[900px]:before:bg-ph-accent',
                )}
              >
                <ResumeRoleMark job={job} />
                <span className='min-w-0 flex-1'>
                  <span className='flex flex-wrap items-center gap-x-2 gap-y-1'>
                    <span className='text-[16px]/[1.3] font-semibold [overflow-wrap:anywhere]'>
                      {job.company}
                    </span>
                    {isCurrent(job) && (
                      <PhChip tone='ok'>{copy.current}</PhChip>
                    )}
                  </span>
                  <span className='mt-0.5 block text-[15px]/[1.4] [overflow-wrap:anywhere]'>
                    {job.role}
                  </span>
                  <span className='mt-0.5 block text-[13px]/[1.4] text-ph-mute'>
                    {formatPeriod(job.startMonth, job.endMonth, lang)}
                  </span>
                </span>
                <ChevronRight
                  aria-hidden='true'
                  className='size-5 shrink-0 text-ph-mute @min-[900px]:hidden'
                />
              </button>
            </li>
          );
        })}
      </ul>
    </PhCard>
  );
}
