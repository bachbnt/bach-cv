/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { HEADING, Section } from '@/skins/trade/blocks/data-resume-section';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';

/** The rows of a typical list of jobs, as many as the seed has. */
const ROLES = 4;
/** The events of a typical page by year, newest first: the jobs, the degrees and the certificates together (14 rows in 5 years). */
const EVENT_YEARS = [5, 3, 2, 3, 1];
/** A row of the events (a line and a half of text, one border), and the bar of a year. */
const EVENT_ROW = 'h-[46.6px]';
const ROW = 'rounded-none border-0 border-b';
/** The heads of the notes: one line on a wide window, the button and the text wrap on a phone (the second role has the longest name). */
const NOTE_HEAD = [
  'h-[111px] min-[600px]:h-[55px]',
  'h-[127px] min-[600px]:h-[55px]',
  'h-[111px] min-[600px]:h-[55px]',
  'h-[111px] min-[600px]:h-[55px]',
];

/**
 * The jobs while they load, laid out as the loaded ones are: the Experience section (the legend line, the statement with its header and a
 * row for each role, the notes with the first one open) and the Events section (the filter and the years), each with its real heading
 * and text. The first note is open as in the loaded page, so its body is a picture and the text beside or under it, as tall as a typical role.
 */
export function DataResumeSkeleton() {
  const { experience: copy } = useCopy(resumeCopy);
  const { resume } = useCopy(tradeDataCopy);
  return (
    <>
      <Section id='tv-experience' title={copy.title}>
        <div
          aria-hidden='true'
          className='flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-3.5 pb-2'
        >
          <TvSkeleton className='h-5 min-w-0 flex-1 basis-[200px]' />
          <TvSkeleton className='h-[30px] w-[131px]' />
        </div>
        <div aria-hidden='true' className='max-w-full'>
          <div className='flex h-8 items-center border-y border-tv-line bg-tv-bg px-3.5 text-xs text-tv-mute'>
            {resume.statement.role}
          </div>
          {Array.from({ length: ROLES }, (_, i) => (
            <TvSkeleton
              key={i}
              data-skeleton={i === 0 ? 'item' : undefined}
              className={cn('h-12', ROW)}
            />
          ))}
        </div>
        <h3 className={HEADING}>
          {resume.notes.title}
          <span className='ml-2 text-xs font-normal text-tv-mute'>
            {resume.notes.lead}
          </span>
        </h3>
        <ol aria-hidden='true' className='m-0 list-none p-0'>
          {NOTE_HEAD.map((head, i) => (
            <li key={i} className={i === 0 ? 'border-b border-tv-line' : ''}>
              <TvSkeleton className={cn(head, ROW, i === 0 && 'border-b-0')} />
              {i === 0 && <NoteBody />}
            </li>
          ))}
        </ol>
      </Section>
      <Section id='tv-events' title={resume.events.title}>
        <p className='px-3.5 pb-2 text-xs text-tv-mute'>{resume.events.lead}</p>
        <div aria-hidden='true'>
          <div className='flex flex-wrap gap-1.5 px-3.5 pb-2'>
            {['w-[37px]', 'w-[51px]', 'w-[82px]', 'w-[92px]'].map((width) => (
              <TvSkeleton key={width} className={cn('h-[26px]', width)} />
            ))}
          </div>
          {EVENT_YEARS.map((rows, year) => (
            <div key={year}>
              <TvSkeleton className='h-[26px] rounded-none border-x-0' />
              {Array.from({ length: rows }, (_, i) => (
                <TvSkeleton key={i} className={cn(EVENT_ROW, ROW)} />
              ))}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

/** The body of the open note: the picture (beside the text from 901px) and the text, which is as tall as the first role's. */
function NoteBody() {
  return (
    <div className='grid gap-x-5 gap-y-3 px-3.5 pb-4 min-[901px]:grid-cols-[minmax(0,1fr)_240px] min-[901px]:pl-[182px]'>
      <TvSkeleton className='aspect-video min-[901px]:col-start-2 min-[901px]:row-start-1' />
      <div className='flex h-[1119px] min-w-0 flex-col gap-3 min-[600px]:h-[657px] min-[901px]:col-start-1 min-[901px]:row-start-1 min-[901px]:h-[757px]'>
        <TvSkeleton className='h-24 flex-none' />
        <TvSkeleton className='h-[117px] flex-none' />
        <TvSkeleton className='h-16 flex-none' />
        <TvSkeleton className='min-h-0 flex-1' />
      </div>
    </div>
  );
}
