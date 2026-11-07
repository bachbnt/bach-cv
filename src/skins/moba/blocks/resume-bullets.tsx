/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown } from 'lucide-react';
import { useId } from 'react';
import { cn } from '@/lib/utils';

/**
 * The responsibilities of a role: a button and a list that slides open (grid rows 0fr to 1fr). Shut, the list is `inert`, so it is out of
 * the keyboard and the reading order and only the button is reachable. The open state belongs to the role, which can open it itself.
 */
export function ResumeBullets({
  bullets,
  open,
  onToggle,
  show,
  hide,
}: {
  bullets: string[];
  open: boolean;
  onToggle: () => void;
  show: string;
  hide: string;
}) {
  const id = useId();
  return (
    <div className='mt-4'>
      <button
        type='button'
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
        className='inline-flex min-h-10 cursor-pointer items-center gap-2 text-[13px] font-bold tracking-[0.04em] text-mb-gold-ink hover:text-mb-gold-lo dark:hover:text-mb-title pointer-coarse:min-h-11'
      >
        {open ? hide : show}
        <ChevronDown
          aria-hidden='true'
          className={cn(
            'size-4 transition-transform duration-300 motion-reduce:transition-none',
            open && 'rotate-180',
          )}
        />
      </button>
      <div
        id={id}
        data-open={open}
        inert={!open}
        className='grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out data-[open=true]:grid-rows-[1fr] motion-reduce:transition-none'
      >
        <div className='overflow-hidden'>
          <ul className='m-0 grid list-none gap-2 p-0 pt-3'>
            {bullets.map((bullet) => (
              <li
                key={bullet}
                className='mb-bullet relative pl-5 text-[14.5px] leading-[1.6] text-mb-ink/90'
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
