/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { cn } from '@/lib/utils';
import { AcSkeleton } from '@/skins/academic/ui/ac-skeleton';

/** The widths of the keywords of the seed (a word each, the dot between them left out), so the shapes wrap as the loaded words do. */
const WORDS = [
  'w-[2.7em]',
  'w-[2.6em]',
  'w-[7.2em]',
  'w-[3.6em]',
  'w-[2.4em]',
  'w-[3.4em]',
  'w-[1.7em]',
  'w-[3em]',
  'w-[2.1em]',
  'w-[5.3em]',
  'w-[3.6em]',
  'w-[3.9em]',
  'w-[3.1em]',
  'w-[7.8em]',
  'w-[3.3em]',
  'w-[3em]',
  'w-[2.6em]',
  'w-[3.5em]',
  'w-[4.6em]',
  'w-[2.1em]',
];

/** The keywords that are not written yet: "Keywords" is the page's own word, the rest a run of blank shapes that wraps in the same measure. */
export function HomeKeywordsSkeleton({ label }: { label: string }) {
  return (
    <section className='max-w-[640px] px-1.5 text-[0.95em]'>
      <b className='mr-2 font-ac-note text-[1.04em] font-normal text-ac-md'>
        {label}
      </b>
      <span aria-hidden='true'>
        {WORDS.map((width, i) => (
          <AcSkeleton
            key={i}
            className={cn('mr-4 inline-block h-5 align-middle', width)}
          />
        ))}
      </span>
    </section>
  );
}
