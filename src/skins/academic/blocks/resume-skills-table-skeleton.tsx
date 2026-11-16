/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { academicResumeCopy } from '@/content/copy/academic-resume';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** What the seed has: the listed skills. Each row is the height of a row of the loaded table. */
const ROWS = 34;

const TH =
  'py-2 pr-2.5 text-left font-ac-note text-[18px] font-normal whitespace-nowrap';

const CELL =
  'border-b-[1.5px] border-dashed border-ac-faint py-[7px] pr-2.5 align-middle max-[760px]:block max-[760px]:border-0 max-[760px]:p-0';

/**
 * The table of the skills that is not written yet: the note in the margin (the page's own words), the row of area chips, the caption and the
 * heads of the columns (also the page's own words) and rows of the height of the loaded ones.
 */
export function ResumeSkillsTableSkeleton() {
  const { skills } = useCopy(resumeCopy);
  const words = useCopy(academicResumeCopy).skills;
  const note = (
    <>
      <AcNoteBig>{words.tally.title}</AcNoteBig>
      <AcNoteCap>{words.tally.text}</AcNoteCap>
      <AcSkeleton className='mt-2 h-[22px] w-24' />
    </>
  );

  return (
    <AcRow note={note} tone='a' sticky>
      <div aria-hidden='true' className='mb-3.5 flex flex-wrap gap-2'>
        {['w-[51px]', 'w-[166px]', 'w-[78px]', 'w-[192px]', 'w-[158px]'].map(
          (width) => (
            <AcSkeleton key={width} className={`h-[34px] ${width}`} />
          ),
        )}
      </div>
      <table className='w-full table-fixed border-collapse border-y-[2.5px] border-ac-ink/70 text-[0.93em] tabular-nums max-[760px]:block'>
        <caption className='pb-3 text-left text-[0.94em]/[1.45] caption-top max-[760px]:block'>
          {words.caption}
        </caption>
        <thead className='max-[760px]:hidden'>
          <tr className='border-b-2 border-dashed border-ac-rule'>
            <th scope='col' className={`${TH} w-[23%]`}>
              {words.columns.skill}
            </th>
            <th scope='col' className={`${TH} w-[25%]`}>
              {words.columns.area}
            </th>
            <th scope='col' className={`${TH} w-[12%] pr-[18px] text-right`}>
              {words.columns.months}
            </th>
            <th scope='col' aria-hidden='true' className='w-[15%]' />
            <th
              scope='col'
              className='py-2 text-left font-ac-note text-[18px] font-normal whitespace-nowrap'
            >
              {skills.evidence.usedAt}
            </th>
          </tr>
        </thead>
        <tbody aria-hidden='true' className='max-[760px]:block'>
          {Array.from({ length: ROWS }, (_, i) => (
            <tr
              key={i}
              className='h-[79px] min-[900px]:max-[1189px]:h-[104px] max-[760px]:grid max-[760px]:h-auto max-[760px]:grid-cols-[1fr_auto] max-[760px]:items-center max-[760px]:gap-x-3 max-[760px]:border-b-[1.5px] max-[760px]:border-dashed max-[760px]:border-ac-faint max-[760px]:py-2'
            >
              <td
                className={`${CELL} max-[760px]:col-start-1 max-[760px]:row-start-1 max-[760px]:h-7`}
              >
                <AcSkeleton className='w-3/5 max-[760px]:w-2/5' />
              </td>
              <td
                className={`${CELL} max-[760px]:col-span-2 max-[760px]:row-start-3 max-[760px]:h-[22px]`}
              >
                <AcSkeleton className='w-4/5 max-[760px]:w-1/4' />
              </td>
              <td
                className={`${CELL} max-[760px]:col-start-2 max-[760px]:row-start-1 max-[760px]:h-7`}
              >
                <AcSkeleton className='ml-auto w-10' />
              </td>
              <td className={`${CELL} max-[760px]:hidden`}>
                <AcSkeleton className='h-[19px] w-16' />
              </td>
              <td
                className={`${CELL} max-[760px]:col-span-2 max-[760px]:row-start-2 max-[760px]:h-[52px]`}
              >
                <AcSkeleton className='w-4/5' />
                <AcSkeleton className='mt-2 w-3/5' />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </AcRow>
  );
}
