/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { AcRow } from '@/skins/academic/ui/ac-note';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';
import { AcSkeletonLine } from '@/skins/academic/ui/ac-skeleton-line';

/** The widths of the technology tags of a role (what the seed has, so the tags wrap as the loaded ones do). */
const TAGS = [
  'w-[73px]',
  'w-[62px]',
  'w-[65px]',
  'w-[145px]',
  'w-[136px]',
  'w-[111px]',
  'w-[104px]',
  'w-[69px]',
  'w-[47px]',
];

/** The lines of the responsibilities of the first role, which is open (the number of lines of each point). */
const POINTS = [3, 3, 3, 2, 3, 4, 3, 4, 3];

/**
 * A role that is not written yet: the number and the company, the title, the period, the summary and the technologies, with the note in the
 * margin beside them. The first role is the current one: no logo, a longer summary, a key project and its responsibilities open.
 */
export function ResumeRoleSkeleton({ first }: { first: boolean }) {
  const note = (
    <>
      {!first && (
        <div
          aria-hidden='true'
          className='ac-tape relative mb-3 w-full max-w-[200px] bg-ac-polaroid p-2 shadow-ac-photo max-[899px]:max-w-[150px]'
        >
          <AcSkeleton className='aspect-[4/3] h-auto w-full' />
        </div>
      )}
      <AcSkeletonLine className='h-[34px]' barClassName='h-7 w-24' />
      {first && (
        <AcSkeletonLine className='mt-[3px] h-[21.45px]' barClassName='w-28' />
      )}
    </>
  );

  return (
    <article aria-hidden='true' className='mb-10'>
      <AcRow note={note} tone={first ? 'd' : 'b'} sticky>
        <AcSkeletonLine className='h-[37px]' barClassName='h-6 w-2/5' />
        <AcSkeletonLine className='mt-1 h-[1.58em]' barClassName='w-1/3' />
        <AcSkeletonLine className='h-[27px]' barClassName='w-1/4' />
        <div className='mt-3'>
          {Array.from({ length: first ? 3 : 2 }, (_, i) => (
            <AcSkeletonLine
              key={i}
              className='h-[1.58em]'
              barClassName={i === (first ? 2 : 1) ? 'w-3/5' : undefined}
            />
          ))}
        </div>
        {first && (
          <div className='mt-4 border-l-[3px] border-ac-faint py-1 pl-4'>
            <AcSkeletonLine className='h-[25px]' barClassName='w-20' />
            <AcSkeletonLine className='h-[1.58em]' barClassName='w-1/2' />
            <AcSkeletonLine className='h-[1.5em]' />
            <AcSkeletonLine className='h-[1.5em]' />
            <AcSkeletonLine className='h-[1.5em]' barClassName='w-3/5' />
            <AcSkeletonLine
              className='hidden h-[1.5em] max-[760px]:flex'
              barClassName='w-2/5'
            />
          </div>
        )}
        <div className='mt-4 flex flex-wrap gap-x-2 gap-y-[9px]'>
          {TAGS.slice(0, first ? 9 : 5).map((width) => (
            <AcSkeleton key={width} className={cn('h-7', width)} />
          ))}
        </div>
        <div className='mt-4'>
          <AcSkeletonLine className='h-[37px]' barClassName='w-[176px]' />
          {first && (
            <div className='flex flex-col gap-2.5 pt-3 pl-5'>
              {POINTS.map((lines, i) => (
                <div key={i}>
                  {Array.from({ length: lines }, (_, line) => (
                    <AcSkeletonLine
                      key={line}
                      className='h-[1.5em]'
                      barClassName={line === lines - 1 ? 'w-2/3' : undefined}
                    />
                  ))}
                  {/* the points are longer on a narrow page, where the text is narrower */}
                  {Array.from(
                    { length: Math.round(lines * 0.7) },
                    (_, line) => (
                      <AcSkeletonLine
                        key={`more-${line}`}
                        className='hidden h-[1.5em] max-[760px]:flex'
                      />
                    ),
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AcRow>
    </article>
  );
}
