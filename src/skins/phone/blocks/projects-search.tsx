/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { CircleX, Search } from 'lucide-react';
import { useRef } from 'react';
import { phoneProjectsCopy } from '@/content/copy/phone-projects';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';

/**
 * The search field the way a phone draws one: a pill with a magnifier, a clear button once there is text (the native one is taken off, it is
 * too small to touch) and a keyboard whose action key says Search. 16px type, so a phone does not zoom into it.
 */
export function ProjectsSearch({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const own = useCopy(phoneProjectsCopy);
  const input = useRef<HTMLInputElement>(null);
  const { value, set } = view.search;
  return (
    <div className='relative'>
      <Search
        aria-hidden='true'
        className='pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ph-mute'
      />
      <input
        ref={input}
        type='search'
        inputMode='search'
        enterKeyHint='search'
        autoComplete='off'
        autoCapitalize='off'
        spellCheck={false}
        aria-label={copy.filters.search}
        placeholder={copy.filters.searchPlaceholder}
        value={value}
        onChange={(event) => set(event.target.value)}
        className={cn(
          'h-12 w-full rounded-full border-[1.5px] border-ph-line bg-ph-sheet-2 pl-11 text-[16px] text-ellipsis text-ph-ink transition-[border-color] duration-100 outline-none placeholder:text-ph-mute focus-visible:border-ph-accent [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
          value === '' ? 'pr-4' : 'pr-12',
        )}
      />
      {value !== '' && (
        <button
          type='button'
          aria-label={own.clearSearch}
          onClick={() => {
            set('');
            input.current?.focus();
          }}
          className='absolute top-1/2 right-1 inline-grid size-10 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ph-mute transition-[scale,color] duration-100 hover:text-ph-ink active:scale-90 pointer-coarse:size-11'
        >
          <CircleX aria-hidden='true' className='size-5' />
        </button>
      )}
    </div>
  );
}
