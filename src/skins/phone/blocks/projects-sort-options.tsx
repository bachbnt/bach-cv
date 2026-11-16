/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Check } from 'lucide-react';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/** The orders of the list as a radio group (the order in use is checked, with a check as well as the weight), one tap picks one. */
export function ProjectsSortOptions({
  view,
  onPick,
}: {
  view: ProjectView;
  onPick: () => void;
}) {
  const copy = useCopy(projectsCopy);
  const { sort } = view;
  return (
    <div role='radiogroup' aria-label={copy.sortLabel} className='p-2'>
      {sort.options.map((value) => {
        const current = sort.value === value;
        return (
          <button
            key={value}
            type='button'
            role='radio'
            aria-checked={current}
            onClick={() => {
              sort.set(value);
              onPick();
            }}
            className={cn(
              'flex min-h-12 w-full cursor-pointer items-center justify-between gap-3 rounded-ph-inner px-4 text-left text-[16px]/[1.3] transition-[background-color] duration-100 hover:bg-ph-sheet-3',
              current
                ? 'bg-ph-accent/15 font-bold text-ph-accent-ink'
                : 'font-medium',
            )}
          >
            {copy.sort[value]}
            {current && (
              <Check
                aria-hidden='true'
                className='size-5 shrink-0'
                strokeWidth={3}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
